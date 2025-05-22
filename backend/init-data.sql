USE SocialMediaAnalyticsPro;
 
-- Insert YouTube platform if it doesn't exist
INSERT IGNORE INTO platforms (name, api_name) 
VALUES ('YouTube', 'youtube'); 