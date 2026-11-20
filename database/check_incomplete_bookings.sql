SELECT COUNT(*) AS incomplete_bookings
FROM booking_requests
WHERE package_id IS NULL
   OR client_name IS NULL OR TRIM(client_name) = ''
   OR email IS NULL OR TRIM(email) = ''
   OR contact_number IS NULL OR TRIM(contact_number) = ''
   OR travel_date IS NULL
   OR adults IS NULL
   OR children IS NULL
   OR payment_method IS NULL OR TRIM(payment_method) = '';