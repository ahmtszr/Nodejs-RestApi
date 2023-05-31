## REST API with NodeJS and PostgreSQL

## INSTALLATION STEPS

1- Review the documentation for PostgreSQL installation

```shell
https://www.postgresql.org/docs/ and create your schema in database
```

2- We install npm

```shell
npm install
```

3- Create yourself an .env file in the project home directory

4- Fill in the .env file you created by adapting it to the .env.example file.

```shell
And it finished. Now let's complete our code and test our api in Postman or similar test tools.
```

Note: Tokens that we store by invalidating in our database, so that your database does not swell; I thought it should be
deleted via trigger every 7 days, 15 days or 30 days (at the end of the time period you specify as per your need). I
will share the trigger code I prepared for this with you below:

```shell
CREATE OR REPLACE FUNCTION <here is the name of trigger function>()
  RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM <table name where you hold invalid tokens>
  WHERE "createdAt" < NOW() - INTERVAL '1 minute';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER <create the name of the directory where your trigger function is located>
AFTER INSERT ON <table name where you hold invalid tokens>
EXECUTE FUNCTION <here is the name of trigger function>();
```

Create your trigger by typing these codes into a query page in your postgresql panel.

-What does this project offer us?

```shell
-We can add and delete products. 
-You can update the products and view the product list. 
-You will have PostgreSQL database to hold all your data.
-The user will be able to be created and have the jwt token, thus providing the authorized user feature.
-Thanks to the Auth module, your sessions will be secure and the tokens you use will be invalidated when the session ends.
```