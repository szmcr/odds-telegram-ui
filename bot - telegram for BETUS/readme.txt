#How to activate the Telegram API
=========================================

SETEP 1: https://my.telegram.org/auth

STEP 2: Enter the phone number example +50689809090 (You must have telegram previously installed on your mobile)

STEP 3: Check your telegram chat and find your Code.

STEP 4: Enter "Confirmation code" and singin example DNnHU6WXDhM

STEP 5: Click in Your Telegram Core -> API development tools -> Create new application

STEP 6: Create new application using this values when finish click "Create application" (without any VPN):
- App title: Write whatever
- Short name: Write whatever
- URL: Write whatever
- Platform: Desktop
- Description: Write whatever

Telegram BOT Configuration
=========================================
STEP 7: Set your API configuration into config.ini file using your code editor, replace api_id, api_hash values and save.
Example:
api_id=800000
api_hash='92365bccf27abcd80000bb990e00000'

STEP 8: In telegram app, Create or Join channels manually (public or private) and remember well the field called "link" because it is the one that will be used for the bot (ex: t.me/you_channel).

STEP 9: Set your channels into channels.txt file using your code editor and save, example:
CHANNEL1
CHANNEL2
CAHNNEL3
etc

STEP 10: Set your custom message into message.txt file using your code editor and save.

STEP 11: Run BOT using botTelegram.exe executable file for start mesaaging.
- Please enter your phone (or bot token): +50670187930 (+CODE AREA + PHONE NUMBER)
- Please enter the code you received: 233322 (Check your telegram app for get code)

STEP 12: Define the sending frequency in minutes from the file config.ini, this will send the message every so often.
[CONFIG]
TIME_MINUTES=1
