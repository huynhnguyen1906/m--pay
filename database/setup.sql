-- Complete database setup script
-- Run this to reset and initialize the database

-- 1. Create database if not exists
CREATE DATABASE IF NOT EXISTS mpay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mpay;

-- 2. Execute schema
SOURCE schema.sql;

-- 3. Execute seed data
SOURCE seed.sql;
