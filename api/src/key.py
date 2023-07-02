from cryptography.fernet import Fernet

#! unable to read file when running pytest
# with open(r"./../assets/key", "r") as f:
#     key = f.read()
#     fernet = Fernet(key)

key = "B4i3n_UKh-pKijF03VbuuzWg5oQK5IfdSnGVMIsNzVg="
fernet = Fernet(key)
