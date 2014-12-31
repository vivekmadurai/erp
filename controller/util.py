from google.appengine.api import mail
import string
import random

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def send_confirmation_mail(emailId, password):
        url = "https://erpfog.appspot.com/signin"
        senderAddress = "erpfog.com Support <support@erpfog.com>"
        subject = "Confirm your registration"
        body = """
                Thank you for creating an account! 
                Please make use of the below username and password to access the system
                Username: %s
                Password: %s
                %s
                
                You can change your password by visiting My Account
                """ %(emailId, password, url)

        mail.send_mail(senderAddress, emailId, subject, body)