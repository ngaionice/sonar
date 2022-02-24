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

create table IndividualPermission (
    token string not null references Individual (email) on delete cascade,
    permission string(6) not null,
    primary key (token, permission)
);

-- mainUrl: the url
create table Image (
    id string primary key, -- the file id from g-drive api
    mainUrl string not null, -- the webContentLink
    useCache boolean default false -- whether to upload this file to imgur simultaneously for sharing
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