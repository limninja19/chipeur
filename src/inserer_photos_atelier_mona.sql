-- Colle ce SQL dans : Supabase Dashboard → SQL Editor → New query → Run
-- Il trouve automatiquement le défi Atelier Mona et insère 40 photos

DO $$
DECLARE
  defi_id UUID;
  profile_ids UUID[];
  n INT;
BEGIN
  -- Trouver le défi Atelier Mona
  SELECT id INTO defi_id FROM defis
  WHERE merchant_name ILIKE '%mona%' OR title ILIKE '%mona%'
  ORDER BY created_at DESC LIMIT 1;

  IF defi_id IS NULL THEN
    RAISE EXCEPTION 'Défi Atelier Mona introuvable. Vérifie le nom dans la table defis.';
  END IF;

  RAISE NOTICE 'Défi trouvé : %', defi_id;

  -- Récupérer les IDs de profils existants
  SELECT ARRAY_AGG(id ORDER BY created_at) INTO profile_ids
  FROM (SELECT id, created_at FROM profiles LIMIT 40) t;

  n := ARRAY_LENGTH(profile_ids, 1);

  IF n IS NULL OR n = 0 THEN
    RAISE EXCEPTION 'Aucun profil trouvé dans la base.';
  END IF;

  RAISE NOTICE '% profils disponibles', n;

  -- Insérer les 40 photos
  INSERT INTO posts (author_id, content, image_url, post_type, defi_id, location, tags, created_at) VALUES

  (profile_ids[1 + (0 % n)],  'Nouvelle tenue trouvée chez Atelier Mona 🛍️ Trop contente de ce look !',             'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '120 hours'),
  (profile_ids[1 + (1 % n)],  'Look du jour signé Atelier Mona ✨ #ModeSaintDié',                                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '117 hours'),
  (profile_ids[1 + (2 % n)],  'Shopping matinal à l''Atelier, coup de cœur total 💛',                               'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '114 hours'),
  (profile_ids[1 + (3 % n)],  'Ce manteau je ne pouvais pas le laisser là-bas 😍',                                  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '111 hours'),
  (profile_ids[1 + (4 % n)],  'Sortie shopping avec ma sœur, on a trouvé des pépites !',                            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '108 hours'),
  (profile_ids[1 + (5 % n)],  'Ma nouvelle robe pour les beaux jours ☀️ #AtélierMona',                              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '105 hours'),
  (profile_ids[1 + (6 % n)],  'Tenue 100% locale, fière de mon look du weekend 🌿',                                 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '102 hours'),
  (profile_ids[1 + (7 % n)],  'Le sourire quand tu trouves exactement ce que tu cherchais 😊',                      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '99 hours'),
  (profile_ids[1 + (8 % n)],  'Journée mode à Saint-Dié 🏡 #Local #Chipeur',                                        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '96 hours'),
  (profile_ids[1 + (9 % n)],  'Ce top à pois c''est ma nouvelle obsession 🖤',                                      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '93 hours'),
  (profile_ids[1 + (10 % n)], 'Dans la boutique, trop dur de choisir ! Finalement j''ai tout pris 😂',              'https://images.unsplash.com/photo-1556905055-8f358a7a47b3?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '90 hours'),
  (profile_ids[1 + (11 % n)], 'L''essayage du samedi matin chez Mona 🛍️ Must do !',                                'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '87 hours'),
  (profile_ids[1 + (12 % n)], 'Ambiance cocooning dans la boutique, j''adore l''atmosphère !',                      'https://images.unsplash.com/photo-1524504388515-6a7b69a4b7b7?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '84 hours'),
  (profile_ids[1 + (13 % n)], 'Le rayon accessoires m''a ruinée mais j''assume 💅',                                 'https://images.unsplash.com/photo-1613677135043-a2512fbf49fa?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '81 hours'),
  (profile_ids[1 + (14 % n)], 'Nouvelle pièce pour ma garde-robe ✂️ Qualité irréprochable',                         'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '78 hours'),
  (profile_ids[1 + (15 % n)], 'Défi Atelier Mona relevé ! Ma tenue préférée du mois 🏆',                           'https://images.unsplash.com/photo-1571867424488-4565932edb41?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '75 hours'),
  (profile_ids[1 + (16 % n)], 'Selfie cabine d''essayage chez Mona 📸 Trop craquante cette robe',                   'https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '72 hours'),
  (profile_ids[1 + (17 % n)], 'Look professionnel chic, parfait pour le bureau ! 💼',                               'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '69 hours'),
  (profile_ids[1 + (18 % n)], 'Je suis venue pour regarder et je repars avec 3 sacs 😅',                            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '66 hours'),
  (profile_ids[1 + (19 % n)], 'Coup de cœur absolu pour cette veste en lin ☀️',                                     'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '63 hours'),
  (profile_ids[1 + (20 % n)], 'Unboxing de ma commande Atelier Mona 📦 Tout est parfait !',                         'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '60 hours'),
  (profile_ids[1 + (21 % n)], 'Premier essayage à la maison, validé à 100% ! ✅',                                   'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '57 hours'),
  (profile_ids[1 + (22 % n)], 'Ma chambre transformée en cabine d''essayage 😂 #Défi',                              'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '54 hours'),
  (profile_ids[1 + (23 % n)], 'La robe de l''été 2026 selon moi 🌸 Merci Atelier Mona !',                           'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '51 hours'),
  (profile_ids[1 + (24 % n)], 'Petite séance photo maison pour partager mon look 📷',                               'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '48 hours'),
  (profile_ids[1 + (25 % n)], 'Balade dans Saint-Dié avec mon nouveau look ☀️ #Chipeur',                            'https://images.unsplash.com/photo-1562572159-4efd90232ece?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '45 hours'),
  (profile_ids[1 + (26 % n)], 'Journée ensoleillée, tenue légère de chez Mona 🌿',                                  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '42 hours'),
  (profile_ids[1 + (27 % n)], 'Portrait avec ma nouvelle tenue dans les Vosges 🏔️',                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '39 hours'),
  (profile_ids[1 + (28 % n)], 'Style décontracté pour ce dimanche en famille 💛',                                   'https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '36 hours'),
  (profile_ids[1 + (29 % n)], 'Look automne-hiver, je suis prête pour la saison froide ! 🍂',                       'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '33 hours'),
  (profile_ids[1 + (30 % n)], 'Quand ta tenue fait des jaloux dans la rue 😎 #AtélierMona',                         'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '30 hours'),
  (profile_ids[1 + (31 % n)], 'Coup de soleil, look d''été 🌞 Robe trouvée chez Mona !',                            'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '27 hours'),
  (profile_ids[1 + (32 % n)], 'Vibe citadine avec mes nouvelles pièces locales 🏙️',                                'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '24 hours'),
  (profile_ids[1 + (33 % n)], 'Ce sourire quand on porte quelque chose qui nous ressemble ❤️',                      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '21 hours'),
  (profile_ids[1 + (34 % n)], 'Minimaliste mais stylée, merci Atelier Mona 🖤',                                     'https://images.unsplash.com/photo-1469460340997-2f854421e72f?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '18 hours'),
  (profile_ids[1 + (35 % n)], 'Weekend look parfait pour une sortie dans les Vosges 🌲',                            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '15 hours'),
  (profile_ids[1 + (36 % n)], 'Ma sœur m''a emmenée là-bas et on est ressorties avec plein de sacs 😂',            'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '12 hours'),
  (profile_ids[1 + (37 % n)], 'Mon look préféré de la saison, trouvé dans notre belle boutique locale ✨',           'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '9 hours'),
  (profile_ids[1 + (38 % n)], 'Merci Atelier Mona pour ce pull tout doux 🧡 parfait pour l''automne',              'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '6 hours'),
  (profile_ids[1 + (39 % n)], 'J''ai relevé le défi ! Ma pièce coup de cœur de ce mois 🏆✨',                      'https://images.unsplash.com/photo-1506956191951-7a88da4435e5?w=600&h=750&fit=crop', 'decouverte', defi_id, 'Saint-Dié-des-Vosges', ARRAY['#AtélierMona','#Défi','#ModeSaintDié'], NOW() - INTERVAL '3 hours');

  RAISE NOTICE '✅ 40 photos insérées avec succès pour le défi %', defi_id;
END $$;
