-- Add AudioUrl and ImageUrl columns to Todos table
ALTER TABLE `Todos` 
ADD COLUMN `AudioUrl` longtext NULL,
ADD COLUMN `ImageUrl` longtext NULL;

