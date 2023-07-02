from src.key import fernet


class Password:
    def __init__(self, value: str):
        self.value = value

    def encrypt(self):
        self.value = fernet.encrypt(self.value.encode()).decode()

    def decrypt(self):
        self.value = fernet.decrypt(self.value.encode()).decode()
