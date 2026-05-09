<?php

namespace App\Command;

use App\Entity\ServiceCategory;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:seed',
    description: 'Seeds the database with initial data (Admin, Categories, etc.)',
)]
class SeedDataCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private UserRepository $userRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // 1. Create Admin
        $adminEmail = 'admin@serviconnect.com';
        $existingAdmin = $this->userRepository->findOneBy(['email' => $adminEmail]);
        
        if (!$existingAdmin) {
            $admin = new User();
            $admin->setEmail($adminEmail);
            $admin->setFirstName('Admin');
            $admin->setLastName('System');
            $admin->setRole('admin');
            $admin->setIsActive(true);
            $admin->setCountry('BJ');
            $admin->setPasswordHash($this->passwordHasher->hashPassword($admin, 'Admin123!'));
            
            $this->entityManager->persist($admin);
            $io->success('Admin created: ' . $adminEmail);
        } else {
            $io->note('Admin already exists.');
        }

        // 2. Create Categories
        $categories = [
            'Plomberie' => ' plumbing-icon',
            'Électricité' => 'electric-icon',
            'Ménage' => 'clean-icon',
            'Serrurerie' => 'lock-icon',
            'Peinture' => 'paint-icon'
        ];

        foreach ($categories as $name => $icon) {
            $existingCat = $this->entityManager->getRepository(ServiceCategory::class)->findOneBy(['name' => $name]);
            if (!$existingCat) {
                $category = new ServiceCategory();
                $category->setName($name);
                $category->setSlug(strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name))));
                $category->setIconUrl($icon);
                $category->setIsActive(true);
                $this->entityManager->persist($category);
                $io->info('Category created: ' . $name);
            }
        }

        $this->entityManager->flush();
        $io->success('Database seeded successfully!');

        return Command::SUCCESS;
    }
}
