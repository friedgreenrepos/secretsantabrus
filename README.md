# Secret Santa Brus
Extremely simple contactless secret santa Python script. Uses gmail as stmp server. Since May 2022 it's not possible to enable the "less secure apps" setting for a Google account, so as a workaround you'll have to enable 2FA and use an "app password". A decent explanation can be found [in this article](https://towardsdatascience.com/how-to-easily-automate-emails-with-python-8b476045c151).

For the script to work the csv file needs to be of this format:
```
name1,email1
name2,email2
name3,email3
...
```