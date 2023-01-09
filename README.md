# การติดตั้ง

## 1. Clone project หรือ copy file

กรณีที่ไม่สามารถ clone ได้ให้ copy file แล้วแตกไฟล์ใน folder SmartOEE (หรือชื่อตามต้องการ)

ถ้าสามารถใช้ git ได้ ให้ clone repository จาก git repositry

```
# clone project
git clone https://github.com/BENZatMPEN/SmartOEE.git
```

## 2. ติดตั้ง node

ถ้ายังไม่มี node ให้ทำการติดตั้ง node ก่อน

```
curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh
```

## 3. ตั้งค่า environment variables ใน docker-compose.yaml

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
| READ_INTERVAL | "0/3 * * * * *" | รอบที่ต้องการติดต่อกับ PLC (ค่าตั้งต้น 3 วินาที - cron format)                                |
| SYNC_INTERVAL | "0/3 * * * * *" | รอบที่ต้องการติดต่อ API เพื่อทำการตรวจสอบข้อมูลที่มีการเปลี่ยนแปลง (ค่าตั้งต้น 3 วินาที - cron format) |

## 4. เตรียมไฟล์ .env สำหรับ web

สร้างไฟล์ .env

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

cd ./client

touch .env
```

ทำการแก้ไขไฟล์ .env โดย copy เนื้อหาข้างล่าง แล้วเปลี่ยนค่าตามที่ต้องการ

```
PORT=3010

GENERATE_SOURCEMAP=false

REACT_APP_HOST_API_KEY=https://localhost:3020
REACT_APP_GOOGLE_MAPS_KEY=key
```

บันทึกไฟล์ .env

#### ความหมายค่าต่างๆ

| Variable                  | Value               | Description                               |
| ------------------------- | ------------------- | ----------------------------------------- |
| PORT                      | 3010                | port สำหรับเข้าถึง localhost:3010 หรือ [ip]:3010 |
| REACT_APP_HOST_API_KEY    | http://api-url      | URL ของ API (ที่ตั้งค่าส่วนส่วน api)             |
| REACT_APP_GOOGLE_MAPS_KEY | key_from_google_map | key จาก GoogleMaps API                    |


## 5. รันคำสั่ง prepare.sh

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

sh prepare.sh
```

## 6. รัน docker-compose.yaml

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

docker compose up -d

# หรือ

sudo docker compose up -d
```

## 7. สร้างข้อมูลเริ่มต้น

เปิด browser แล้วพิมพ์ URL ของ API

```
http://localhost:3020/init-data
```

หรือ

```
http://[ip]:3020/init-data
```

## 8. เปิดเว็บ

```
http://localhost:3010
```

หรือ

```
http://[ip]:3010
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

sh prepare.sh
```

จากนั้นรัน docker compose เพื่อเริ่มต้นการทำงาน

```
# อยู่ใน folder ที่ clone มา (SmartOEE)

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