-- Útfæra schema
DROP TABLE IF EXISTS signup;
DROP TABLE IF EXISTS events;


CREATE TABLE IF NOT EXISTS events(
  id serial PRIMARY KEY,
  name varchar(64) not NULL,
  slug varchar(64) not NULL,
  description varchar(400),
  created timestamp with time zone not NULL DEFAULT CURRENT_TIMESTAMP,
  updated timestamp with time zone not NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS signup(
  id serial PRIMARY KEY,
  name varchar(64) not NULL,
  description varchar(400),
  event integer REFERENCES events(id) not NULL,
  created timestamp with time zone not NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  username varchar(64) NOT NULL,
  password varchar(256) NOT NULL
);

-- Lykilorð: "123"
INSERT INTO users (username, password) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
