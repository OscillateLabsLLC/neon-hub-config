"""
Neon Hub Configuration Server

This module provides a FastAPI-based web server for managing Neon Hub and Diana configurations.
It includes basic authentication and configuration management capabilities.

Environment Variables:
    NEON_HUB_CONFIG_USERNAME: Username for basic auth (default: "neon")
    NEON_HUB_CONFIG_PASSWORD: Password for basic auth (default: "neon")
    DIANA_PATH: Path to the Diana configuration file (default: "/xdg/config/neon/diana.yaml")
    NEON_PATH: Path to the Neon configuration file (default: "/xdg/config/mycroft/mycroft.conf")
"""
import base64
import logging
from functools import wraps
from os import getenv
from os.path import exists, join, realpath, split, expanduser
from typing import Dict, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic
from fastapi.staticfiles import StaticFiles
from ovos_config import Configuration
from ovos_config.config import update_mycroft_config
from ovos_utils.log import LOG
from ruamel.yaml import YAML

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

VALID_USERNAME = getenv("NEON_HUB_CONFIG_USERNAME", "neon")
VALID_PASSWORD = getenv("NEON_HUB_CONFIG_PASSWORD", "neon")
DIANA_PATH = expanduser(getenv("DIANA_PATH", "/xdg/config/neon/diana.yaml"))
NEON_PATH = expanduser(getenv("NEON_PATH", "/xdg/config/neon/neon.yaml"))

security = HTTPBasic()


class NeonHubConfigManager:
    """
    Singleton class to manage Neon Hub and Diana configurations.

    This class handles loading, saving, and managing configurations for both
    Neon Hub and Diana components. It maintains separate configuration files
    and provides methods for updating and retrieving configurations.

    Attributes:
        logger: Logger instance for tracking operations
        yaml: YAML handler configured for preserving quotes and specific indentation
        default_diana_config: Default configuration for Diana
        neon_config: Instance of Configuration for Neon Hub
        diana_config_path: Full path to the Diana configuration file
        diana_config: Current Diana configuration
        neon_config_path: Full path to the Neon user configuration file
    """

    def __init__(self):
        """Initialize the configuration manager with default settings."""
        # Initialize YAML handler
        self.logger = LOG()
        self.yaml = YAML()
        self.yaml.preserve_quotes = True
        self.yaml.indent(mapping=2, sequence=4, offset=2)

        # Default configuration
        self.default_diana_config = {}

        # Initialize Neon configuration
        self.neon_config = Configuration()
        self.neon_user_config_path = NEON_PATH or self.neon_config.xdg_configs[0].path
        self.neon_user_config = self._load_neon_user_config()

        # Initialize Diana config
        self.diana_config_path = DIANA_PATH
        self.logger.info(f"Loading Diana config in {self.diana_config_path}")
        self.diana_config = self._load_diana_config()

    def _load_diana_config(self) -> Dict:
        """Load Diana configuration from file, creating it with defaults if needed."""
        if not exists(self.diana_config_path):
            self._save_diana_config(self.default_diana_config)
            return self.default_diana_config.copy()

        try:
            with open(self.diana_config_path, "r", encoding="utf-8") as file:
                config = self.yaml.load(file)
                if config is None:  # File exists but is empty
                    config = self.default_diana_config.copy()
                    self._save_diana_config(config)
                self.diana_config = config
                return config
        except Exception as e:
            self.logger.exception(f"Error loading config: {e}")
            return self.default_diana_config.copy()

    def _load_neon_user_config(self) -> Optional[Dict]:
        """
        Load Neon user configuration from file, creating it with defaults if needed.

        Returns:
            Optional[Dict]: The loaded configuration or default configuration if loading fails
        """
        try:
            with open(self.neon_user_config_path, "r", encoding="utf-8") as file:
                config = self.yaml.load(file)
                return config
        except Exception as e:
            self.logger.exception(f"Error loading Neon user config: {e}")

    def _save_diana_config(self, config: Dict) -> None:
        """
        Save Diana configuration to file.

        Args:
            config (Dict): Configuration to save
        """
        try:
            with open(self.diana_config_path, "w+", encoding="utf-8") as file:
                previous_config = self.yaml.load(file) or {}
                new_config = {**previous_config, **config}
                self.yaml.dump(new_config, file)
        except Exception as e:
            self.logger.exception(f"Error saving config: {e}")

    def get_neon_config(self) -> Dict:
        """
        Get the current Neon Hub configuration.

        Returns:
            Dict: Current Neon Hub configuration
        """
        self.neon_config.reload()
        return self.neon_config

    def get_neon_user_config(self) -> Optional[Dict]:
        """
        Get the current Neon user configuration.

        Returns:
            Dict: Current Neon user configuration
        """
        return self._load_neon_user_config()

    def update_neon_config(self, config: Dict) -> Optional[Dict]:
        """
        Update the Neon Hub configuration.

        Args:
            config (Dict): New configuration to apply

        Returns:
            Dict: Updated configuration
        """
        self.logger.info("Updating Neon config")
        update_mycroft_config(config)
        self.neon_config.reload()
        return self.get_neon_user_config()

    def get_diana_config(self) -> Dict:
        """
        Get the current Diana configuration.

        Returns:
            Dict: Current Diana configuration
        """
        self._load_diana_config()
        return self.diana_config

    def update_diana_config(self, config: Dict) -> Dict:
        """
        Update the Diana configuration.

        Args:
            config (Dict): New configuration to apply

        Returns:
            Dict: Updated configuration
        """
        self.logger.info("Updating Diana config")
        self._save_diana_config(config)
        return self._load_diana_config()


app = FastAPI(
    title="Neon Hub Configuration API",
    description="API for managing Neon Hub and Diana configurations with basic authentication",
    version="1.0.0",
)
config_manager = NeonHubConfigManager()

# Configure CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def require_auth(func):
    """Decorator to require authentication for routes"""
    @wraps(func)
    async def wrapper(*args, username: str = Depends(verify_auth_header), **kwargs):
        return await func(*args, username=username, **kwargs)
    return wrapper


async def verify_auth_header(authorization: str = Header(None)):
    """
    Verify the Basic Authentication header.

    Args:
        authorization (str): Authorization header value

    Returns:
        str: Username if authentication is successful

    Raises:
        HTTPException: If authentication fails
    """
    if not authorization or not authorization.startswith("Basic "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    try:
        auth_decoded = base64.b64decode(authorization.split(" ")[1]).decode("utf-8")
        username, password = auth_decoded.split(":")

        if username != VALID_USERNAME or password != VALID_PASSWORD:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        return username
    except Exception as e:
        logger.exception("Auth error: %s", e)
        raise HTTPException(status_code=401, detail="Invalid authentication credentials") from e


def get_config_manager():
    """
    Get the singleton instance of NeonHubConfigManager.

    Returns:
        NeonHubConfigManager: The singleton config manager instance
    """
    return config_manager


@app.post("/auth")
@require_auth
async def authenticate(username: str = Depends(verify_auth_header)):
    """
    Authenticate user credentials.

    Args:
        username (str): Username extracted from Basic Auth header

    Returns:
        dict: Authentication success message with username
    """
    return {"message": "Authentication successful", "username": username}


@app.get("/v1/neon_config")
async def neon_get_config(
    manager: NeonHubConfigManager = Depends(get_config_manager)
):
    """
    Get the current Neon Hub configuration.

    Returns:
        Dict: Current Neon Hub configuration
    """
    return manager.get_neon_config()


@app.post("/v1/neon_config")
async def neon_update_config(
    config: Dict,
    manager: NeonHubConfigManager = Depends(get_config_manager),
):
    """
    Update the Neon Hub configuration.

    Args:
        config (Dict): New configuration to apply

    Returns:
        Dict: Updated configuration
    """
    logger.info("Updating Neon config")
    return manager.update_neon_config(config)

@app.get("/v1/neon_user_config")
async def neon_get_user_config(
    manager: NeonHubConfigManager = Depends(get_config_manager)
):
    """
    Get the current Neon Hub configuration.

    Returns:
        Dict: Current Neon Hub configuration
    """
    config = manager.get_neon_user_config()
    if config is None:
        return {"error": "Failed to load Neon user config"}
    return config


@app.post("/v1/neon_user_config")
async def neon_update_user_config(
    config: Dict,
    manager: NeonHubConfigManager = Depends(get_config_manager),
):
    """
    Update the Neon Hub configuration.

    Args:
        config (Dict): New configuration to apply

    Returns:
        Dict: Updated configuration
    """
    logger.info("Updating Neon config")
    return manager.update_neon_config(config)


@app.get("/v1/diana_config")
async def diana_get_config(
    manager: NeonHubConfigManager = Depends(get_config_manager)
):
    """
    Get the current Diana configuration.

    Returns:
        Dict: Current Diana configuration
    """
    return manager.get_diana_config()


@app.post("/v1/diana_config")
async def diana_update_config(
    config: Dict,
    manager: NeonHubConfigManager = Depends(get_config_manager),
):
    """
    Update the Diana configuration.

    Args:
        config (Dict): New configuration to apply

    Returns:
        Dict: Updated configuration
    """
    logger.info("Updating Diana config")
    return manager.update_diana_config(config)


project_dir, _ = split(realpath(__file__))
app.mount(
    "/",
    StaticFiles(directory=join(project_dir, "static"), html=True),
    name="Neon Hub Configuration",
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=80)
