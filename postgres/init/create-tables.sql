CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent INT,
    CONSTRAINT fk_parent FOREIGN KEY (parent) REFERENCES items (id) ON DELETE SET NULL
);
