<?php

namespace Database\Seeders;

use App\Models\TroubleshootingGuide;
use Illuminate\Database\Seeder;

class TroubleshootingGuideSeeder extends Seeder
{
    public function run(): void
    {
        // Network Issues
        TroubleshootingGuide::create([
            'title' => 'Network Connection Issues',
            'description' => 'Common network connectivity problems and solutions',
            'solution' => "1. Check if Wi-Fi is enabled\n2. Verify network connection status\n3. Restart router/modem\n4. Check network cables\n5. Contact ISP if needed",
            'tags' => ['network', 'wifi', 'internet', 'connection'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/1373/1373604.png'
        ]);

        // Email Problems
        TroubleshootingGuide::create([
            'title' => 'Email Problems',
            'description' => 'Common email issues and their solutions',
            'solution' => "1. Check internet connection\n2. Verify email settings\n3. Clear email cache\n4. Check spam folder\n5. Contact email provider if needed",
            'tags' => ['email', 'communication', 'outlook'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/3178/3178158.png'
        ]);

        // Software Installation
        TroubleshootingGuide::create([
            'title' => 'Software Installation Issues',
            'description' => 'Problems with installing or updating software',
            'solution' => "1. Check system requirements\n2. Run as administrator\n3. Disable antivirus temporarily\n4. Clear temporary files\n5. Download from official source",
            'tags' => ['software', 'installation', 'update'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/1378/1378542.png'
        ]);

        // Printer Problems
        TroubleshootingGuide::create([
            'title' => 'Printer Not Working',
            'description' => 'Common printer issues and troubleshooting steps',
            'solution' => "1. Check printer power and connections\n2. Verify printer is set as default\n3. Clear print queue\n4. Update/reinstall printer drivers\n5. Check for paper jams",
            'tags' => ['printer', 'hardware', 'printing'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/5673/5673058.png'
        ]);

        // Login Issues
        TroubleshootingGuide::create([
            'title' => 'Login Problems',
            'description' => 'Issues with account access and authentication',
            'solution' => "1. Verify username and password\n2. Check Caps Lock status\n3. Clear browser cache/cookies\n4. Reset password if needed\n5. Contact system administrator",
            'tags' => ['login', 'account', 'password', 'access'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/1828/1828395.png'
        ]);

        // Performance Issues
        TroubleshootingGuide::create([
            'title' => 'System Running Slow',
            'description' => 'Computer performance and speed issues',
            'solution' => "1. Close unnecessary programs\n2. Check disk space\n3. Run disk cleanup\n4. Scan for malware\n5. Consider hardware upgrade",
            'tags' => ['performance', 'speed', 'slow', 'computer'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/1350/1350120.png'
        ]);

        // Browser Issues
        TroubleshootingGuide::create([
            'title' => 'Browser Problems',
            'description' => 'Common web browser issues and fixes',
            'solution' => "1. Clear browser cache and cookies\n2. Update browser\n3. Disable extensions\n4. Reset browser settings\n5. Check for malware",
            'tags' => ['browser', 'internet', 'chrome', 'firefox', 'edge'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/781/781683.png'
        ]);

        // Audio Problems
        TroubleshootingGuide::create([
            'title' => 'No Sound/Audio Issues',
            'description' => 'Troubleshooting steps for audio problems',
            'solution' => "1. Check volume levels\n2. Verify audio output device\n3. Update audio drivers\n4. Check physical connections\n5. Test with different application",
            'tags' => ['audio', 'sound', 'speakers', 'volume'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/1082/1082608.png'
        ]);

        // File Access
        TroubleshootingGuide::create([
            'title' => 'File Access Problems',
            'description' => 'Issues with accessing or opening files',
            'solution' => "1. Check file permissions\n2. Verify file location\n3. Run as administrator\n4. Check file format compatibility\n5. Scan for file corruption",
            'tags' => ['files', 'access', 'permissions', 'documents'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/1091/1091916.png'
        ]);

        // Password Reset
        TroubleshootingGuide::create([
            'title' => 'Password Reset Help',
            'description' => 'Guide for resetting forgotten passwords',
            'solution' => "1. Visit password reset page\n2. Verify email address\n3. Check recovery email\n4. Answer security questions\n5. Contact support if needed",
            'tags' => ['password', 'reset', 'account', 'security'],
            'image_path' => 'https://cdn-icons-png.flaticon.com/512/6195/6195699.png'
        ]);
    }
} 