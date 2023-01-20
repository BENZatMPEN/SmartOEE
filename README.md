# การติดตั้ง

## 1. Clone project หรือ copy file

กรณีที่ไม่สามารถ clone ได้ให้ copy file แล้วแตกไฟล์ใน folder SmartOEE (หรือชื่อตามต้องการ)

ถ้าสามารถใช้ git ได้ ให้ clone repository จาก git repositry

```
# clone project
git clone https://github.com/BENZatMPEN/SmartOEE.git
```

## 2. ตั้งค่า environment variables ใน docker-compose.yaml

เข้า folder SmartOEE

```
cd SmartOEE
```

แล้วแก้ไข้ไฟล์ docker-compose.yaml

### ส่วน db

#### environment

| Variable            | Value    | Description     |
| ------------------- | -------- | --------------- |
| MYSQL_ROOT_PASSWORD | admin    | รหัสผ่านสำหรับ root |
| MYSQL_DATABASE      | smartoee | ชื่อ database     |
| MYSQL_USER          | smartoee | ชื่อ user         |
| MYSQL_PASSWORD      | smartoee | รหัสผ่าน          |

#### ports

ถ้าต้องการเข้าถึง database จาก MySQL Client อื่นๆ ให้เอา comment ในส่วนของ ports ออก

```
ports:
  - "33061:3306" # เปลี่ยน 33061 ได้ตามที่ต้องการ
```

### ส่วน phpmyadmin (เครื่องมือจัดการฐานข้อมูล)

#### ports

เข้าถึง phpmyadmin ด้วยการระบุ port localhost:3030 หรือ [ip]:3030

```
ports:
  - "3030:80" #เปลี่ยน 3030 ได้ตามต้องการ
```

### ส่วน api

#### environment

| Variable           | Value                                 | Description                                                      |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------- |
| DB_HOST            | db                                    | **ไม่ต้องเปลี่ยนแปลง**                                               |
| DB_PORT            | 3306                                  | **ไม่ต้องเปลี่ยนแปลง**                                               |
| DB_USER            | smartoee                              | ชืี่อ user ตั้งตาม **MYSQL_USER**                                     |
| DB_PASS            | smartoee                              | รหัสผ่าน ตั้งตาม **MYSQL_PASSWORD**                                  |
| DB_NAME            | smartoee                              | ชื่อ database ตั้งตาม **MYSQL_DATABASE**                             |
| EMAIL_HOST         | smtp.server.com                       | SMTP server                                                      |
| EMAIL_HAS_AUTH     | 0                                     | ถ้า SMTP server มี authentication ให้ตั้งเป็น 1                        |
| EMAIL_USER         | user                                  | ถ้าตั้ง EMAIL_HAS_AUTH เป็น 1 ต้องระบุ username                        |
| EMAIL_PASSWORD     | password                              | ถ้าตั้ง EMAIL_HAS_AUTH เป็น 1 ต้องระบุ รหัสผ่าน                          |
| EMAIL_PORT         | 25                                    | port ของ SMTP server                                             |
| EMAIL_USE_SSL      | 0                                     | ถ้า SMTP server มีการใช้ SSL ให้ตั้งเป็น 1                              |
| EMAIL_DEFAULT_FROM | hello@user.com                        | ชื่อ email ขาออก                                                   |
| LINE_API_URL       | https://notify-api.line.me/api/notify | LINE Notify API URL (ตามคู่มือ https://notify-bot.line.me/doc/en/ ) |
| TOKEN_SECRET       | secret                                | ขอความลับที่ใช้สำหรับสร้าง token (ต้องตั้งใหม่สำหรับทุกไซต์เพื่อความปลอดภัย)       |
| TOKEN_EXPIRES_IN   | 30d                                   | อายุของ token (d = วัน)                                            |
| UPLOAD_FILE_SIZE   | 10                                    | ขนาดของ file ที่ให้ upload ได้ (หน่วยเป็น MB)                          |

#### ports

เข้าถึง api ด้วยการระบุ port localhost:3020 หรือ [ip]:3020

```
ports:
  - "3020:3000" #เปลี่ยน 3020 ได้ตามต้องการ
```

### ส่วน poller

#### environment

| Variable      | Value           | Description                                                                       |
| ------------- | --------------- | --------------------------------------------------------------------------------- |
| SITE_ID       | 1               | เป็น ID ของ Site ที่ส่งข้อมูลให้ (ต้องสร้างจาก web ก่อน)                                    |
| BASE_API_URL  | http://api:3000 | **ไม่ต้องเปลี่ยนแปลง**                                                                |
| READ_INTERVAL | 0/3 * * * * *   | รอบที่ต้องการติดต่อกับ PLC (ค่าตั้งต้น 3 วินาที - cron format)                                |
| SYNC_INTERVAL | 0/3 * * * * *   | รอบที่ต้องการติดต่อ API เพื่อทำการตรวจสอบข้อมูลที่มีการเปลี่ยนแปลง (ค่าตั้งต้น 3 วินาที - cron format) |
| API_USER      | poller@user.com | ชื่อ account (default) ที่ใช้สำหรับติดต่อ API ถ้ามีการเปลี่ยนที่หน้าเว็บจะต้องทำการแก้ไขค่านี้ด้วย        |
| API_PASS      | P@ssword1       | รหัส account (default) ที่ใช้สำหรับติดต่อ API ถ้ามีการเปลี่ยนที่หน้าเว็บจะต้องทำการแก้ไขค่านี้ด้วย       |

### ส่วน web

#### environment

เข้าถึง web ด้วยการระบุ port localhost:3010 หรือ [ip]:3010

```
ports:
  - "3010:80" #เปลี่ยน 3010 ได้ตามต้องการ
```

## 4. เตรียมไฟล์ .env สำหรับ web

สร้างไฟล์ .env

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

cd ./client

touch .env
```

ทำการแก้ไขไฟล์ .env โดย copy เนื้อหาข้างล่าง แล้วเปลี่ยนค่าตามที่ต้องการ

```
REACT_APP_HOST_API_KEY=http://0.0.0.0:3020
REACT_APP_GOOGLE_MAPS_KEY=key
```

บันทึกไฟล์ .env

#### ความหมายค่าต่างๆ ใน .env

| Variable                  | Value               | Description                                              |
| ------------------------- | ------------------- | -------------------------------------------------------- |
| REACT_APP_HOST_API_KEY    | http://0.0.0.0:3020 | URL ของ API เป็น localhost หรือ ip และ port ที่ตั้งไว้ในส่วน api |
| REACT_APP_GOOGLE_MAPS_KEY | key_from_google_map | key จาก GoogleMaps API                                   |

## 5. รัน docker-compose.yaml build

ทุกครั้งที่มีการเปลี่ยนค่าใน docker-compose.yaml และ ./client/.env จะต้องทำการรัน docker compose build ทุกครั้ง

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

docker compose build

# หรือ

sudo docker compose build
```

## 6. รัน docker-compose.yaml

เริ่มการทำงานของโปรแกรมทั้งหมดโดยใช้คำสั่ง docker compose up

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

docker compose up -d

# หรือ

sudo docker compose up -d
```

## 7. เปิดเว็บ

```
http://localhost:3010 หรือ port ที่ตั้งค่าไว้ใน web
```

หรือ

```
http://[ip]:3010 หรือ port ที่ตั้งค่าไว้ใน web
```

**default user**

**user**: admin@user.com

**pass**: P@ssword1

## การอัพเดต code (ใช้ git หรือ copy file)

ในกรณีใช้ git

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

# หยุด docker compsoe

docker compose down

git pull
```
แล้วใช้คำสั่ง docker compose build

```
docker compose build

# หรือ

sudo docker compose build
```

จากนั้นรัน docker compose เพื่อเริ่มต้นการทำงาน

```
docker compose up -d

# หรือ

sudo docker compose up -d
```

## On cloud remove the poller section

TBA

## Backup

TBA

### in ./api/uploads

TBA

### in ./bakcup

TBA