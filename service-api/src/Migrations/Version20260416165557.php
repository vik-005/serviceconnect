<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260416165557 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activity_logs (id BINARY(16) NOT NULL, action VARCHAR(100) NOT NULL, entity_type VARCHAR(100) NOT NULL, entity_id VARCHAR(255) DEFAULT NULL, details JSON DEFAULT NULL, ip_address VARCHAR(45) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id BINARY(16) DEFAULT NULL, INDEX IDX_F34B1DCEA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE banners (id BINARY(16) NOT NULL, title VARCHAR(255) NOT NULL, image_url VARCHAR(500) NOT NULL, target_url VARCHAR(500) DEFAULT NULL, placement VARCHAR(50) DEFAULT \'home\' NOT NULL, is_active TINYINT DEFAULT 1 NOT NULL, start_date DATETIME DEFAULT NULL, end_date DATETIME DEFAULT NULL, display_order INT DEFAULT 0 NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE conversations (id BINARY(16) NOT NULL, status VARCHAR(50) DEFAULT \'open\' NOT NULL, last_message_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, client_id BINARY(16) NOT NULL, provider_profile_id BINARY(16) NOT NULL, INDEX IDX_C2521BF119EB6921 (client_id), INDEX IDX_C2521BF1E94C5E00 (provider_profile_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messages (id BINARY(16) NOT NULL, content LONGTEXT DEFAULT NULL, type VARCHAR(50) DEFAULT \'text\' NOT NULL, media_url VARCHAR(500) DEFAULT NULL, duration_seconds INT DEFAULT NULL, is_read TINYINT DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, conversation_id BINARY(16) NOT NULL, sender_id BINARY(16) NOT NULL, INDEX IDX_DB021E96F624B39D (sender_id), INDEX idx_message_conversation (conversation_id), INDEX idx_message_created (created_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE notifications (id BINARY(16) NOT NULL, type VARCHAR(100) NOT NULL, title VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, is_read TINYINT DEFAULT 0 NOT NULL, metadata JSON DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, user_id BINARY(16) NOT NULL, INDEX IDX_6000B0D3A76ED395 (user_id), INDEX idx_notification_user_read (user_id, is_read), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE portfolios (id BINARY(16) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, media_url VARCHAR(500) NOT NULL, media_type VARCHAR(50) DEFAULT \'image\' NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, provider_profile_id BINARY(16) NOT NULL, INDEX IDX_B81B226FE94C5E00 (provider_profile_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE provider_profiles (id BINARY(16) NOT NULL, bio LONGTEXT DEFAULT NULL, years_experience INT DEFAULT 0 NOT NULL, rating_average DOUBLE PRECISION DEFAULT 0 NOT NULL, total_reviews INT DEFAULT 0 NOT NULL, status VARCHAR(50) DEFAULT \'active\' NOT NULL, is_verified TINYINT DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, user_id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_C372EBD9A76ED395 (user_id), INDEX idx_provider_status (status), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE provider_services (id BINARY(16) NOT NULL, description LONGTEXT DEFAULT NULL, is_active TINYINT DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, provider_profile_id BINARY(16) NOT NULL, category_id BINARY(16) NOT NULL, INDEX IDX_3B708F80E94C5E00 (provider_profile_id), INDEX IDX_3B708F8012469DE2 (category_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE refresh_tokens (id BINARY(16) NOT NULL, token VARCHAR(128) NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_9BACE7E15F37A13B (token), INDEX IDX_9BACE7E1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE reviews (id BINARY(16) NOT NULL, rating INT NOT NULL, comment LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, client_id BINARY(16) NOT NULL, provider_profile_id BINARY(16) NOT NULL, conversation_id BINARY(16) DEFAULT NULL, INDEX IDX_6970EB0F19EB6921 (client_id), INDEX IDX_6970EB0FE94C5E00 (provider_profile_id), INDEX IDX_6970EB0F9AC0396 (conversation_id), UNIQUE INDEX unique_client_provider_review (client_id, provider_profile_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE service_categories (name VARCHAR(150) NOT NULL, slug VARCHAR(150) NOT NULL, icon_url VARCHAR(500) DEFAULT NULL, is_active TINYINT DEFAULT 1 NOT NULL, display_order INT DEFAULT 0 NOT NULL, id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_ACA27FDC5E237E06 (name), UNIQUE INDEX UNIQ_ACA27FDC989D9B62 (slug), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE users (email VARCHAR(180) NOT NULL, phone VARCHAR(20) DEFAULT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT \'client\' NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, avatar_url VARCHAR(500) DEFAULT NULL, latitude DOUBLE PRECISION DEFAULT NULL, longitude DOUBLE PRECISION DEFAULT NULL, city VARCHAR(150) DEFAULT NULL, country VARCHAR(100) DEFAULT \'BJ\' NOT NULL, is_active TINYINT DEFAULT 1 NOT NULL, fcm_token VARCHAR(500) DEFAULT NULL, reset_token VARCHAR(100) DEFAULT NULL, reset_token_expires_at DATETIME DEFAULT NULL, id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), UNIQUE INDEX UNIQ_1483A5E9444F97DD (phone), INDEX idx_user_email (email), INDEX idx_user_role (role), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE activity_logs ADD CONSTRAINT FK_F34B1DCEA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE conversations ADD CONSTRAINT FK_C2521BF119EB6921 FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE conversations ADD CONSTRAINT FK_C2521BF1E94C5E00 FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E969AC0396 FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96F624B39D FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE notifications ADD CONSTRAINT FK_6000B0D3A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE portfolios ADD CONSTRAINT FK_B81B226FE94C5E00 FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE provider_profiles ADD CONSTRAINT FK_C372EBD9A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE provider_services ADD CONSTRAINT FK_3B708F80E94C5E00 FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE provider_services ADD CONSTRAINT FK_3B708F8012469DE2 FOREIGN KEY (category_id) REFERENCES service_categories (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE refresh_tokens ADD CONSTRAINT FK_9BACE7E1A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F19EB6921 FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0FE94C5E00 FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F9AC0396 FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity_logs DROP FOREIGN KEY FK_F34B1DCEA76ED395');
        $this->addSql('ALTER TABLE conversations DROP FOREIGN KEY FK_C2521BF119EB6921');
        $this->addSql('ALTER TABLE conversations DROP FOREIGN KEY FK_C2521BF1E94C5E00');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E969AC0396');
        $this->addSql('ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96F624B39D');
        $this->addSql('ALTER TABLE notifications DROP FOREIGN KEY FK_6000B0D3A76ED395');
        $this->addSql('ALTER TABLE portfolios DROP FOREIGN KEY FK_B81B226FE94C5E00');
        $this->addSql('ALTER TABLE provider_profiles DROP FOREIGN KEY FK_C372EBD9A76ED395');
        $this->addSql('ALTER TABLE provider_services DROP FOREIGN KEY FK_3B708F80E94C5E00');
        $this->addSql('ALTER TABLE provider_services DROP FOREIGN KEY FK_3B708F8012469DE2');
        $this->addSql('ALTER TABLE refresh_tokens DROP FOREIGN KEY FK_9BACE7E1A76ED395');
        $this->addSql('ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0F19EB6921');
        $this->addSql('ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0FE94C5E00');
        $this->addSql('ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0F9AC0396');
        $this->addSql('DROP TABLE activity_logs');
        $this->addSql('DROP TABLE banners');
        $this->addSql('DROP TABLE conversations');
        $this->addSql('DROP TABLE messages');
        $this->addSql('DROP TABLE notifications');
        $this->addSql('DROP TABLE portfolios');
        $this->addSql('DROP TABLE provider_profiles');
        $this->addSql('DROP TABLE provider_services');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE reviews');
        $this->addSql('DROP TABLE service_categories');
        $this->addSql('DROP TABLE users');
    }
}
