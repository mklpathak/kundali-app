import os

class Settings:
    PROJECT_NAME: str = "Kundali Generator"
    VERSION: str = "1.0.0"
    OUTPUT_DIR: str = os.path.join(os.getcwd(), "output")

settings = Settings()
