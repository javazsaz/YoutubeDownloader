# YoutubeDownloader
A software for download audio and videos from Youtube!

**I am not responsible for any illegal activity that is performed with this software. This software has been created for only study purpose**.

For use this software, please install:

**Nodejs**
 
 - Download NodeJs from: https://nodejs.org/en/download/

**ffmpeg**

 - Linux: sudo apt install ffmpeg
 - Windows: Download ffmpeg from: https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z

 For Windows: 
  - Extract folder, rename it with "FFmpeg" name, copy and past it on C:/ path.
  - Open command prompt with admin privileges, and launch this command: setx /m PATH "C:\FFmpeg\bin;%PATH%"
  - Verify that ffmpeg work with command: ffmpeg --version

**MongoDB**

Insert username, password and cluster name of your MongoDB database on /config/db.js file for save and obtain logs file.
https://cloud.mongodb.com
