
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'juju.karas@gmail.com';

  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'juju.karas@gmail.com',
      extensions.crypt('Prospera2026', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Juju Karas"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'juju.karas@gmail.com', 'email_verified', true),
      'email', new_user_id::text, now(), now(), now());
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('Prospera2026', extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = new_user_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, is_admin, subscription_status)
  VALUES (new_user_id, 'juju.karas@gmail.com', 'Juju Karas', true, 'active')
  ON CONFLICT (id) DO UPDATE
    SET is_admin = true, subscription_status = 'active', updated_at = now();
END $$;
