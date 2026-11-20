SELECT
    inquiry_id,
    client_name,
    email,
    contact_number,
    preferred_destination,
    topic,
    message
FROM client_inquiries
ORDER BY inquiry_id DESC;