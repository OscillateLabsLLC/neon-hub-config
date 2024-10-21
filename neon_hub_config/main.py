from os.path import realpath, join, split
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


app = FastAPI()
project_dir, _ = split(realpath(__file__))
app.mount(
    "/",
    StaticFiles(directory=join(project_dir, "static"), html=True),
    name="Neon Hub Configuration",
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
