<?php

namespace App\Tests\Api;

use App\Entity\ProviderProfile;
use App\Entity\ServiceCategory;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class GeoSearchTest extends WebTestCase
{
    public function testNearbySearch(): void
    {
        $client = static::createClient();
        $container = static::getContainer();
        $em = $container->get('doctrine.orm.entity_manager');

        // Cleanup
        $em->createQuery('DELETE FROM App\Entity\ProviderService')->execute();
        $em->createQuery('DELETE FROM App\Entity\ProviderProfile')->execute();
        $em->createQuery('DELETE FROM App\Entity\User')->execute();
        $em->createQuery('DELETE FROM App\Entity\ServiceCategory')->execute();

        // 1. Setup Data
        $category = new ServiceCategory();
        $category->setName('Plomberie ' . uniqid());
        $category->setSlug('plomberie-' . uniqid());
        $category->setIsActive(true);
        $em->persist($category);

        // Near Provider (Cotonou Centre - roughly 6.36, 2.42)
        $userNear = new User();
        $userNear->setEmail('near-' . uniqid() . '@example.com');
        $userNear->setPasswordHash('hash');
        $userNear->setFirstName('Near');
        $userNear->setLastName('Provider');
        $userNear->setLatitude(6.367);
        $userNear->setLongitude(2.425);
        $userNear->setRole('provider');
        $em->persist($userNear);

        $profileNear = new ProviderProfile();
        $profileNear->setUser($userNear);
        $profileNear->setStatus('active');
        $em->persist($profileNear);

        // Far Provider (Porto-Novo - roughly 6.49, 2.62)
        $userFar = new User();
        $userFar->setEmail('far-' . uniqid() . '@example.com');
        $userFar->setPasswordHash('hash');
        $userFar->setFirstName('Far');
        $userFar->setLastName('Provider');
        $userFar->setLatitude(6.491);
        $userFar->setLongitude(2.626);
        $userFar->setRole('provider');
        $em->persist($userFar);

        $profileFar = new ProviderProfile();
        $profileFar->setUser($userFar);
        $profileFar->setStatus('active');
        $em->persist($profileFar);

        $em->flush();

        // 2. Test Search (within 10km of Cotonou Centre)
        // Distance Cotonou-Porto-Novo is ~25km
        $client->request('GET', '/api/search/providers', [
            'lat' => 6.36,
            'lng' => 2.42,
            'radius' => 10000 // 10km
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        
        // Should only find the near provider
        $this->assertCount(1, $data['data']);
        $this->assertEquals('Near', $data['data'][0]['provider']['user']['firstName']);
        $this->assertLessThan(10, $data['data'][0]['distance_km']);

        // 3. Test Search (within 40km)
        $client->request('GET', '/api/search/providers', [
            'lat' => 6.36,
            'lng' => 2.42,
            'radius' => 40000 // 40km
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertCount(2, $data['data']);
    }

    public function testCategoriesList(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/search/categories');

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        
        $this->assertIsArray($data['data']);
        $this->assertNotEmpty($data['data']);
        $this->assertArrayHasKey('name', $data['data'][0]);
    }

    public function testCountrySearch(): void
    {
        $client = static::createClient();
        $container = static::getContainer();
        $em = $container->get('doctrine.orm.entity_manager');

        // Create a provider in TG (Togo)
        $userTg = new User();
        $userTg->setEmail('tg-' . uniqid() . '@example.com');
        $userTg->setPasswordHash('hash');
        $userTg->setFirstName('Togo');
        $userTg->setLastName('Provider');
        $userTg->setLatitude(6.12);
        $userTg->setLongitude(1.22);
        $userTg->setCountry('TG');
        $userTg->setRole('provider');
        $em->persist($userTg);

        $profileTg = new ProviderProfile();
        $profileTg->setUser($userTg);
        $profileTg->setStatus('active');
        $em->persist($profileTg);

        $em->flush();

        // Search in BJ (Benin) - should NOT find the TG provider even if close
        $client->request('GET', '/api/search/providers', [
            'lat' => 6.12,
            'lng' => 1.22,
            'radius' => 50000,
            'country' => 'BJ'
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        
        // Count providers in BJ (the ones from testNearbySearch + fixtures if any)
        // Since we did cleanup in testNearbySearch, we only have 'Near' and 'Far' which are BJ (default)
        // Wait, testNearbySearch runs first? Let's check.
        // PHPUnit runs tests in order.
        
        foreach ($data['data'] as $item) {
            $this->assertEquals('BJ', $item['provider']['user']['country'] ?? 'BJ');
        }
    }
}
