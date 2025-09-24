#!/usr/bin/env node

/**
 * Script de démarrage optimisé pour Node.js 22 sur Infomaniak
 * Gère l'installation des dépendances et le démarrage de l'application
 */

// Vérification de la version Node.js
const nodeVersion = process.version;
console.log(`🔍 Version Node.js détectée: ${nodeVersion}`);

if (!nodeVersion.startsWith('v22')) {
  console.warn('⚠️ Cette application est optimisée pour Node.js 22');
}

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage eSignPro sur Infomaniak...');

// Vérifier si node_modules existe
const nodeModulesPath = path.join(__dirname, 'node_modules');
const packageLockPath = path.join(__dirname, 'package-lock.json');

async function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('📦 Installation des dépendances...');
    
    const installCommand = fs.existsSync(packageLockPath) ? 'npm ci' : 'npm install';
    const install = spawn('npm', fs.existsSync(packageLockPath) ? ['ci'] : ['install'], {
      stdio: 'inherit',
      shell: true
    });

    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dépendances installées avec succès');
        resolve();
      } else {
        console.error('❌ Erreur lors de l\'installation des dépendances');
        reject(new Error(`Installation failed with code ${code}`));
      }
    });

    install.on('error', (err) => {
      console.error('❌ Erreur lors de l\'installation:', err);
      reject(err);
    });
  });
}

async function buildApplication() {
  return new Promise((resolve, reject) => {
    console.log('🔨 Construction de l\'application...');
    
    const build = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });

    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Application construite avec succès');
        resolve();
      } else {
        console.log('⚠️ Build échoué, tentative de démarrage quand même...');
        resolve(); // Continue même si le build échoue
      }
    });

    build.on('error', (err) => {
      console.error('❌ Erreur lors du build:', err);
      resolve(); // Continue même si le build échoue
    });
  });
}

async function startApplication() {
  return new Promise((resolve, reject) => {
    console.log('🌟 Démarrage de l\'application Next.js...');
    
    const port = process.env.PORT || 3000;
    console.log(`📡 Port d'écoute: ${port}`);
    
    // Essayer différentes commandes de démarrage
    const startCommands = [
      ['npx', 'next', 'start', '-p', port.toString()],
      ['./node_modules/.bin/next', 'start', '-p', port.toString()],
      ['node', './node_modules/next/dist/bin/next', 'start', '-p', port.toString()]
    ];

    let commandIndex = 0;

    function tryNextCommand() {
      if (commandIndex >= startCommands.length) {
        reject(new Error('Toutes les commandes de démarrage ont échoué'));
        return;
      }

      const [command, ...args] = startCommands[commandIndex];
      console.log(`🔄 Tentative ${commandIndex + 1}: ${command} ${args.join(' ')}`);

      const start = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: port.toString()
        }
      });

      start.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Application démarrée avec succès');
          resolve();
        } else {
          console.log(`❌ Commande ${commandIndex + 1} échouée (code ${code})`);
          commandIndex++;
          tryNextCommand();
        }
      });

      start.on('error', (err) => {
        console.error(`❌ Erreur commande ${commandIndex + 1}:`, err.message);
        commandIndex++;
        tryNextCommand();
      });

      // Timeout de 10 secondes pour chaque tentative
      setTimeout(() => {
        start.kill();
        console.log(`⏰ Timeout commande ${commandIndex + 1}`);
        commandIndex++;
        tryNextCommand();
      }, 10000);
    }

    tryNextCommand();
  });
}

async function main() {
  try {
    // Étape 1: Installer les dépendances si nécessaire
    if (!fs.existsSync(nodeModulesPath)) {
      await installDependencies();
    } else {
      console.log('✅ node_modules déjà présent');
    }

    // Étape 2: Construire l'application si nécessaire
    const nextBuildPath = path.join(__dirname, '.next');
    if (!fs.existsSync(nextBuildPath)) {
      await buildApplication();
    } else {
      console.log('✅ Application déjà construite');
    }

    // Étape 3: Démarrer l'application
    await startApplication();

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    
    // Fallback: essayer de démarrer un serveur simple
    console.log('🔄 Tentative de fallback...');
    
    try {
      const express = require('express');
      const app = express();
      const port = process.env.PORT || 3000;

      app.get('/', (req, res) => {
        res.send(`
          <h1>eSignPro - Maintenance</h1>
          <p>L'application est en cours de démarrage...</p>
          <p>Veuillez réessayer dans quelques minutes.</p>
          <script>setTimeout(() => location.reload(), 30000);</script>
        `);
      });

      app.listen(port, () => {
        console.log(`🔧 Serveur de maintenance démarré sur le port ${port}`);
      });

    } catch (fallbackError) {
      console.error('💥 Fallback échoué:', fallbackError.message);
      process.exit(1);
    }
  }
}

// Gestion des signaux
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt de l\'application...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt de l\'application...');
  process.exit(0);
});

// Démarrer l'application
main().catch((error) => {
  console.error('💥 Erreur non gérée:', error);
  process.exit(1);
});
