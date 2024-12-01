1.npm i for install all dependencies
(npm i -f ,if any circulary dependency present for smooth installation)

2.prisma client db integrated with MySql use

//make sure the port and prisma urls are correct (env is included)
//used "ranktask" db for stroing the datas.
create ranktask or any other db collection for storing the data,and make this change in .env

npx prisma init
npx prisma generate
npx prisma migrate dev //migrate file

3.npm start (running the server)

(use the route url path same like the postman document attached.)
