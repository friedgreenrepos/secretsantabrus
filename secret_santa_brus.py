import smtplib, ssl
import csv
import random
import os
from dotenv import load_dotenv
from email.message import EmailMessage

load_dotenv()

csv_file = os.getenv("SANTA_FILENAME")
sender_address = os.getenv("SENDER_ADDRESS")
password = os.getenv("PASSWORD")

# Transform csv file into dict
print("Reading csv...")
with open(csv_file, mode='r') as santa_csv:
    reader = csv.reader(santa_csv)
    gifters_dict = {rows[0]:rows[1] for rows in reader}

# Create gifters list from dict keys and shuffle it
print("Making gifters list...")
gifters_list = list(gifters_dict.keys())
random.shuffle(gifters_list)

# Shift list by 1 to get giftees list
print("Making giftees list...")
giftees_list = []
for k in range(-1, len(gifters_list)-1):
    giftees_list.append(gifters_list[k])

######## Email management
email = EmailMessage()
message = """Subject: Secret SantaBrus 2023

Hey {gifter},

Quest'anno sarai la Secret SantaBrus di {giftee}!

OH OH OH - Buon Natale!!

(Messaggio automatico generato da Calanca-Gang Hacker LTD, esclusivamente per il gruppo Fregnabrus)
"""

port = 465  # For SSL

# Create a secure SSL context
print("Creating a secure SSL context...")
context = ssl.create_default_context()

print("Sending emails...")
with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
    server.login(sender_address, password)
    for k in range(len(gifters_list)):
        gifter = gifters_list[k]
        giftee = giftees_list[k]
        server.sendmail(
            sender_address,
            gifters_dict[gifter],
            message.format(gifter=gifter,giftee=giftee),
        )
        print(f"Email {k+1} of {len(gifters_list)} sent!")
