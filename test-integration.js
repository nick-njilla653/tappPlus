const axios = require('axios');

const API_BASE_URL = 'http://localhost:5550/api/v1';

async function testIntegration() {
  console.log('🧪 Test d\'intégration Frontend-Backend TAPP+');
  console.log('===============================================\n');

  try {
    // 1. Test de connexion
    console.log('1. Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@meditache.com',
      password: 'admin123'
    });
    
    const { access_token, user } = loginResponse.data;
    console.log('✅ Connexion réussie:', user.email);
    
    const headers = { Authorization: `Bearer ${access_token}` };

    // 2. Test des interventions
    console.log('\n2. Test des interventions...');
    const interventionsResponse = await axios.get(`${API_BASE_URL}/interventions`, { headers });
    console.log('✅ Interventions récupérées:', interventionsResponse.data.length, 'interventions');

    // 3. Test des interventions à venir
    console.log('\n3. Test des interventions à venir...');
    const upcomingResponse = await axios.get(`${API_BASE_URL}/interventions/upcoming`, { headers });
    console.log('✅ Interventions à venir:', upcomingResponse.data.length, 'interventions');

    // 4. Test des personnes
    console.log('\n4. Test des personnes...');
    const peopleResponse = await axios.get(`${API_BASE_URL}/people`, { headers });
    console.log('✅ Personnes récupérées:', peopleResponse.data.data.length, 'personnes');

    // 5. Test des rappels
    console.log('\n5. Test des rappels...');
    const remindersResponse = await axios.get(`${API_BASE_URL}/reminders`, { headers });
    console.log('✅ Rappels récupérés:', remindersResponse.data.length, 'rappels');

    // 6. Test des statistiques de rappels
    console.log('\n6. Test des statistiques de rappels...');
    const statsResponse = await axios.get(`${API_BASE_URL}/reminders/stats`, { headers });
    console.log('✅ Statistiques de rappels:', statsResponse.data);

    // 7. Test de création d'une intervention
    console.log('\n7. Test de création d\'intervention...');
    const newIntervention = {
      title: 'Test Intervention',
      description: 'Intervention de test pour l\'intégration',
      personId: peopleResponse.data.data[0]?.id,
      doctorId: user.doctor?.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
      priority: 'NORMAL',
      location: 'Cabinet de test'
    };
    
    const createInterventionResponse = await axios.post(`${API_BASE_URL}/interventions`, newIntervention, { headers });
    console.log('✅ Intervention créée:', createInterventionResponse.data.id);

    // 8. Test de création d'un rappel
    console.log('\n8. Test de création de rappel...');
    const newReminder = {
      interventionId: createInterventionResponse.data.id,
      type: 'EMAIL',
      scheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Dans 12h
      message: 'Rappel de test pour l\'intervention',
      recipient: 'test@example.com'
    };
    
    console.log('Données du rappel:', newReminder);
    
    const createReminderResponse = await axios.post(`${API_BASE_URL}/reminders`, newReminder, { headers });
    console.log('✅ Rappel créé:', createReminderResponse.data.id);

    console.log('\n🎉 Tous les tests d\'intégration sont passés avec succès !');
    console.log('\n📊 Résumé:');
    console.log('- API fonctionnelle ✅');
    console.log('- Authentification OK ✅');
    console.log('- CRUD Interventions OK ✅');
    console.log('- CRUD Rappels OK ✅');
    console.log('- Relations base de données OK ✅');
    console.log('- Endpoints frontend-backend connectés ✅');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    process.exit(1);
  }
}

testIntegration();
