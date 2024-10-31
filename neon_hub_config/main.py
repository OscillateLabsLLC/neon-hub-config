from os.path import exists, join, realpath, split
from typing import Dict

from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from ovos_config import Configuration
from ovos_utils.log import LOG
from ruamel.yaml import YAML


class NeonHubConfigManager:
    """Singleton class to manage Neon Hub configuration."""
    def __init__(self):
        # Initialize YAML handler
        self.logger = LOG()
        self.yaml = YAML()
        self.yaml.preserve_quotes = True
        self.yaml.indent(mapping=2, sequence=4, offset=2)

        # Default configuration
        self.default_diana_config = {}

        # Initialize Neon configuration
        self.neon_config = Configuration()

        # Initialize Diana config
        self.neon_config_folder = "/".join(self.neon_config.xdg_configs[0].path.split("/")[:-1])
        self.diana_config_path = f"{self.neon_config_folder}/diana.yaml"
        self.diana_config = self._load_diana_config()

    def _load_diana_config(self) -> Dict:
        """Load diana config from file, creating it with defaults if needed."""
        if not exists(self.diana_config_path):
            # Create the file with default config if it doesn't exist
            self._save_diana_config(self.default_diana_config)
            return self.default_diana_config.copy()

        try:
            with open(self.diana_config_path, "r", encoding="utf-8") as file:
                config = self.yaml.load(file)
                if config is None:  # File exists but is empty
                    config = self.default_diana_config.copy()
                    self._save_diana_config(config)
                return config
        except Exception as e:
            self.logger.exception(f"Error loading config: {e}")
            return self.default_diana_config.copy()

    def _save_diana_config(self, config: Dict) -> None:
        """Save diana config to file."""
        try:
            with open(self.diana_config_path, "w", encoding="utf-8") as file:
                self.yaml.dump(config, file)
        except Exception as e:
            self.logger.exception(f"Error saving config: {e}")

    def get_neon_config(self) -> Dict:
        """Get the current Neon Hub configuration."""
        return self.neon_config

    def update_neon_config(self, config: Dict) -> Dict:
        """Update the Neon Hub configuration."""
        self.logger.debug("Updating Neon config")
        self.neon_config.update(config)
        return self.neon_config

    def get_diana_config(self) -> Dict:
        """Get the current Diana configuration."""
        return self.diana_config

    def update_diana_config(self, config: Dict) -> Dict:
        """Update the Diana configuration."""
        self.logger.debug("Updating Diana config")
        self.diana_config.update(config)
        self._save_diana_config(self.diana_config)
        return self.diana_config


app = FastAPI()
config_manager = NeonHubConfigManager()


# Dependency to get the config manager
def get_config_manager():
    """Get the singleton instance of NeonHubConfigManager."""
    return config_manager


@app.get("/v1/neon_config")
async def neon_get_config(manager: NeonHubConfigManager = Depends(get_config_manager)):
    """Get the current Neon Hub configuration."""
    return manager.get_neon_config()


@app.post("/v1/neon_config")
async def neon_update_config(config: Dict, manager: NeonHubConfigManager = Depends(get_config_manager)):
    """Update the Neon Hub configuration."""
    return manager.update_neon_config(config)


@app.get("/v1/diana_config")
async def diana_get_config(manager: NeonHubConfigManager = Depends(get_config_manager)):
    """Get the current Diana configuration."""
    return manager.get_diana_config()


@app.post("/v1/diana_config")
async def diana_update_config(config: Dict, manager: NeonHubConfigManager = Depends(get_config_manager)):
    """Update the Diana configuration."""
    return manager.update_diana_config(config)


project_dir, _ = split(realpath(__file__))
app.mount(
    "/",
    StaticFiles(directory=join(project_dir, "static"), html=True),
    name="Neon Hub Configuration",
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
