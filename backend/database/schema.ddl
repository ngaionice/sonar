set sql_safe_updates = true;

drop database if exists trie cascade;
create database if not exists trie;

use trie;

create table Individual (
    email string primary key,
    name string not null,
    salt string not null
);

create table Role (
    title string primary key,
    id int unique not null
);

create table IndividualRole (
    email string references Individual (email) on delete cascade,
    title string references Role (title) on delete restrict,
    primary key (email, title)
);

create table Image (
    id string primary key, -- the key (i.e. file name) on S3 bucket
    mainUrl string not null, -- the URL to access the resource on S3
    useCache boolean not null default false, -- whether this file should be on imgur
    readRoles int not null default 1
);

create table ImageCache (
    imageId string primary key references Image (id) on delete cascade,
    cacheUrl string not null, -- the imgur url
    deleteHash string not null -- the delete hash needed to delete image from imgur
);

create table ImageTag (
    imageId string references Image (id) on delete cascade,
    tag string,
    primary key (imageId, tag)
);

create table RefreshToken (
    token string primary key,
    email string not null references Individual (email) on delete cascade,
    revoked boolean not null default false,
    createdAt timestamptz not null default current_timestamp
);