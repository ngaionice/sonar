set sql_safe_updates = true;

drop database if exists trie cascade;
create database if not exists trie;

use trie;

-- there should only be 1 entry in this table; maybe we don't even want a table?
create table ServerToken (
    email string primary key,
    idToken string not null,
    refreshToken string not null,
    lastExported timestamptz not null
);

create table Individual (
    email string primary key,
    name string not null
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
    useCache boolean default false, -- whether this file should be on imgur
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