from cryptography.fernet import Fernet

with open(r"./../assets/key", "r") as f:
    key = f.read()
    fernet = Fernet(key)
