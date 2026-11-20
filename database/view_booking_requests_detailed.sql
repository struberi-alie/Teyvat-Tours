SELECT
    booking_id,
    package_id,
    client_name,
    email,
    contact_number,
    travel_date,
    adults,
    children,
    payment_method
FROM booking_requests
ORDER BY booking_id ASC;
