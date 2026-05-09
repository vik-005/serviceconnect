<?php

namespace App\DataFixtures;

use App\Entity\User;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Super Admin
        $superAdmin = new User();
        $superAdmin->setEmail('superadmin@connceservice.com');
        $superAdmin->setFirstName('Super');
        $superAdmin->setLastName('Admin');
        $superAdmin->setRole('admin');
        $superAdmin->setPasswordHash($this->passwordHasher->hashPassword($superAdmin, 'admin123'));
        $superAdmin->setCountry('BJ');
        $superAdmin->setIsActive(true);
        $manager->persist($superAdmin);

        // 2. Categories
        $categoriesData = [
            ['name' => 'Bricolage', 'icon' => 'hammer', 'order' => 1],
            ['name' => 'Ménage', 'icon' => 'broom', 'order' => 2],
            ['name' => 'Santé & Beauté', 'icon' => 'heart', 'order' => 3],
            ['name' => 'Informatique', 'icon' => 'laptop', 'order' => 4],
            ['name' => 'Transport', 'icon' => 'car', 'order' => 5],
            ['name' => 'Déménagement', 'icon' => 'box', 'order' => 6],
        ];

        $categories = [];
        foreach ($categoriesData as $data) {
            $category = new \App\Entity\ServiceCategory();
            $category->setName($data['name']);
            $category->setSlug(strtolower(str_replace(' ', '-', $data['name'])));
            $category->setIconUrl('https://api.iconify.design/mdi:' . $data['icon'] . '.svg');
            $category->setDisplayOrder($data['order']);
            $category->setIsActive(true);
            $manager->persist($category);
            $categories[] = $category;
        }

        // 3. Providers
        for ($i = 1; $i <= 5; $i++) {
            $provider = new User();
            $provider->setEmail("provider$i@example.com");
            $provider->setFirstName("Prestataire $i");
            $provider->setLastName("Benin");
            $provider->setRole('provider');
            $provider->setPasswordHash($this->passwordHasher->hashPassword($provider, 'password123'));
            $provider->setLatitude(6.367 + ($i * 0.01));
            $provider->setLongitude(2.425 + ($i * 0.01));
            $provider->setCity('Cotonou');
            $provider->setIsActive(true);
            $manager->persist($provider);

            $profile = new \App\Entity\ProviderProfile();
            $profile->setUser($provider);
            $profile->setBio("Je suis un professionnel certifié avec plus de " . ($i + 2) . " ans d'expérience.");
            $profile->setYearsExperience($i + 2);
            $profile->setStatus('active');
            $profile->setIsVerified($i % 2 === 0);
            $manager->persist($profile);

            // Link to a category
            $service = new \App\Entity\ProviderService();
            $service->setProviderProfile($profile);
            $service->setCategory($categories[$i % count($categories)]);
            $service->setIsActive(true);
            $manager->persist($service);
        }

        // 4. Banners
        $bannersData = [
            ['title' => 'Promotion Bricolage', 'placement' => 'home', 'url' => 'https://images.unsplash.com/photo-1581244276891-83393a8d3bfb'],
            ['title' => 'Nouveau service Ménage', 'placement' => 'home', 'url' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a'],
            ['title' => 'Pub Spéciale', 'placement' => 'search', 'url' => 'https://images.unsplash.com/photo-1540340334550-6390d4ff8823'],
        ];

        foreach ($bannersData as $i => $data) {
            $banner = new \App\Entity\Banner();
            $banner->setTitle($data['title']);
            $banner->setImageUrl($data['url']);
            $banner->setPlacement($data['placement']);
            $banner->setDisplayOrder($i);
            $banner->setIsActive(true);
            $manager->persist($banner);
        }

        $manager->flush();

        echo "✅ Fixtures chargées avec succès !\n";
    }
}

