-- Útfæra test gögn fyrir events
TRUNCATE TABLE events CASCADE; -- tæmir töflu!
INSERT INTO events (name, slug, description) VALUES ('Víso', 'viso', 'Drekka bjór');
INSERT INTO events (name, slug, description) VALUES ('Árshátið', 'arshatid', 'Drekka bjór í fínum fötum');
INSERT INTO events (name, slug, description) VALUES ('Vinnum saman heimavinnu', 'vinnum-saman-heimavinnu', '');
INSERT INTO events (name, slug, description) VALUES ('Útskriftarferð', 'utskriftarferd', 'Vamos a la Kroatía');


-- Útfæra test gögn fyrir signup
TRUNCATE TABLE signup; -- tæmir töflu!
INSERT INTO signup (name, comment, event) VALUES ('Benedikt Aron', 'Vá hvað ég nenni ekki að gera heimavinnu', 3);
INSERT INTO signup (name, comment, event) VALUES ('Benedikt Aron', 'Nautasteik í matinn', 2);
INSERT INTO signup (name, comment, event) VALUES ('Benedikt Aron', '', 1);
INSERT INTO signup (name, comment, event) VALUES ('Benedikt Aron', '', 4);
INSERT INTO signup (name, comment, event) VALUES ('Hakon Gunnarsson', '', 1);
INSERT INTO signup (name, comment, event) VALUES ('Hakon Gunnarsson', '', 4);
INSERT INTO signup (name, comment, event) VALUES ('Olafur M.', 'Ég er með COVID', 1);
INSERT INTO signup (name, comment, event) VALUES ('Aron Björn', '', 1);
INSERT INTO signup (name, comment, event) VALUES ('Hrafnhildur Ólafsdóttir', '', 4);
INSERT INTO signup (name, comment, event) VALUES ('Jon Gunnar', '', 4);

TRUNCATE TABLE users;
-- Lykilorð: "123"
INSERT INTO users (username, password) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
