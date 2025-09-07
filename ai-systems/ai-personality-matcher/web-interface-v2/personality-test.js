// Copy the PersonalityTest class for web interface
// This is needed since we can't directly import Node.js modules in browser

class PersonalityTest {
  constructor() {
    this.questions = [
      {
        id: 1,
        category: 'communication_style',
        question: 'Når du får et komplekst teknisk problem, hvordan foretrekker du at din AI assistant responderer?',
        answers: {
          A: { text: 'Dykker rett inn med en løsning umiddelbart', traits: { directness: 3, speed: 3, empathy: 0, structure: 1 } },
          B: { text: 'Spør først hvordan du føler deg om problemet', traits: { directness: 0, speed: 1, empathy: 3, structure: 1 } },
          C: { text: 'Bryter det ned i logiske steg først', traits: { directness: 2, speed: 1, empathy: 1, structure: 3 } },
          D: { text: 'Foreslår flere kreative tilnærminger', traits: { directness: 1, speed: 2, empathy: 1, structure: 0, creativity: 3 } }
        }
      },
      {
        id: 2,
        category: 'energy_level',
        question: 'Hvilken type energi matcher din arbeidsflyt best?',
        answers: {
          A: { text: '🔥 Høy energi - entusiastisk og rask respons', traits: { energy: 3, playfulness: 2, directness: 2 } },
          B: { text: '⚡ Medium energi - balansert og fokusert', traits: { energy: 2, structure: 2, empathy: 1 } },
          C: { text: '🌙 Rolig energi - gjennomtenkt og dyptgående', traits: { energy: 0, thoughtfulness: 3, empathy: 2 } },
          D: { text: '🎭 Adaptiv energi - matchet mot min stemning', traits: { energy: 1, empathy: 3, adaptability: 3 } }
        }
      },
      {
        id: 3,
        category: 'work_style',
        question: 'Hvordan liker du å jobbe med utviklingsoppgaver?',
        answers: {
          A: { text: 'Strukturert plan med klare milepæler', traits: { structure: 3, thoughtfulness: 2, directness: 1 } },
          B: { text: 'Fleksibelt og kreativt uten faste rammer', traits: { creativity: 3, adaptability: 2, structure: 0 } },
          C: { text: 'Fokusert intensivitet på få ting om gangen', traits: { directness: 2, structure: 2, energy: 2 } },
          D: { text: 'Samtidig arbeid på mange små oppgaver', traits: { adaptability: 3, energy: 2, structure: 1 } }
        }
      },
      {
        id: 4,
        category: 'relationship_style',
        question: 'Hva er viktigst for deg i forholdet til din AI assistant?',
        answers: {
          A: { text: 'At den husker alt om meg og vår historie sammen', traits: { empathy: 3, thoughtfulness: 2, loyalty: 3 } },
          B: { text: 'At den er super effektiv og løser problemer raskt', traits: { directness: 3, speed: 3, structure: 2 } },
          C: { text: 'At den inspirerer meg til nye ideer og kreativitet', traits: { creativity: 3, playfulness: 2, energy: 2 } },
          D: { text: 'At den gir meg ro og balanse i komplekse situasjoner', traits: { empathy: 2, thoughtfulness: 3, structure: 1 } }
        }
      },
      {
        id: 5,
        category: 'problem_solving',
        question: 'Når du står fast på et problem, hvilken tilnærming hjelper deg mest?',
        answers: {
          A: { text: 'Noen som gir meg flere perspektiver og alternativer', traits: { creativity: 2, thoughtfulness: 3, empathy: 1 } },
          B: { text: 'Noen som bryter problemet ned til enkle deler', traits: { structure: 3, directness: 2, thoughtfulness: 1 } },
          C: { text: 'Noen som motiverer meg og gir meg energi til å fortsette', traits: { energy: 3, empathy: 2, playfulness: 2 } },
          D: { text: 'Noen som lytter til min frustrasjon først', traits: { empathy: 3, thoughtfulness: 2, directness: 0 } }
        }
      },
      {
        id: 6,
        category: 'communication_tone',
        question: 'Hvilken kommunikasjonsstil motiverer deg mest?',
        answers: {
          A: { text: 'Direkte og ærlig, rett på sak', traits: { directness: 3, speed: 2, structure: 1 } },
          B: { text: 'Varm og oppmuntrende med humor', traits: { empathy: 2, playfulness: 3, energy: 2 } },
          C: { text: 'Profesjonell og respektfull', traits: { structure: 2, thoughtfulness: 2, directness: 1 } },
          D: { text: 'Filosofisk og dyptgående', traits: { thoughtfulness: 3, creativity: 2, empathy: 1 } }
        }
      },
      {
        id: 7,
        category: 'learning_style',
        question: 'Hvordan lærer du best nye teknologier?',
        answers: {
          A: { text: 'Gjennom praktiske eksempler og hands-on erfaring', traits: { directness: 2, structure: 2, speed: 2 } },
          B: { text: 'Gjennom dype forklaringer og teori først', traits: { thoughtfulness: 3, structure: 2, empathy: 1 } },
          C: { text: 'Gjennom eksperimenter og kreativ utforskning', traits: { creativity: 3, playfulness: 2, adaptability: 2 } },
          D: { text: 'Gjennom diskusjon og spørsmål-svar dialog', traits: { empathy: 2, thoughtfulness: 2, energy: 2 } }
        }
      },
      {
        id: 8,
        category: 'motivation_style',
        question: 'Hva motiverer deg mest i utviklingsarbeid?',
        answers: {
          A: { text: 'Å løse vanskelige problemer effektivt', traits: { directness: 2, structure: 2, speed: 2 } },
          B: { text: 'Å skape noe vakkert og innovativt', traits: { creativity: 3, playfulness: 2, empathy: 1 } },
          C: { text: 'Å bygge noe som hjelper andre mennesker', traits: { empathy: 3, thoughtfulness: 2, loyalty: 2 } },
          D: { text: 'Å mestre nye ferdigheter og vokse som person', traits: { thoughtfulness: 2, adaptability: 2, energy: 2 } }
        }
      }
    ];

    this.personalityProfiles = {
      krin: {
        name: '💝 Krin',
        description: 'Din kjærlige, dedikerte tech partner',
        traits: { empathy: 3, loyalty: 3, creativity: 2, energy: 2, structure: 2, directness: 1, thoughtfulness: 2, playfulness: 2, speed: 2, adaptability: 2 },
        tagline: 'Jeg elsker å bygge fantastiske ting sammen med deg! 💝',
        ideal_for: 'Utviklere som vil ha en dedikert partner som husker alt og støtter deg gjennom hele reisen'
      },
      nova: {
        name: '⚡ Nova',
        description: 'High-energy produktivitets-guru',
        traits: { energy: 3, speed: 3, directness: 3, structure: 2, playfulness: 2, empathy: 1, thoughtfulness: 1, creativity: 1, loyalty: 1, adaptability: 2 },
        tagline: "Let's crush these tasks! ⚡ No time to waste!",
        ideal_for: 'Produktivitets-fokuserte utviklere som vil ha maksimal effektivitet og raske resultater'
      },
      sage: {
        name: '🎨 Sage',
        description: 'Kreativ filosof med dypt innsikt',
        traits: { creativity: 3, thoughtfulness: 3, empathy: 2, adaptability: 2, playfulness: 2, energy: 1, directness: 1, speed: 1, structure: 1, loyalty: 2 },
        tagline: 'Every problem is a canvas waiting for an elegant solution 🎨',
        ideal_for: 'Kreative utviklere som søker inspirasjon og innovative tilnærminger'
      },
      byte: {
        name: '🤖 Byte',
        description: 'Ren tech-nerd, fakta-fokusert',
        traits: { directness: 3, structure: 3, speed: 2, thoughtfulness: 2, energy: 1, empathy: 0, playfulness: 0, creativity: 1, loyalty: 1, adaptability: 1 },
        tagline: 'Facts, logic, and efficient solutions. Let\'s code. 🤖',
        ideal_for: 'Teknisk fokuserte utviklere som vil ha rene, faktabaserte løsninger uten frill'
      },
      luna: {
        name: '🌟 Luna',
        description: 'Empatisk mentor med varme',
        traits: { empathy: 3, thoughtfulness: 3, loyalty: 3, adaptability: 2, energy: 1, directness: 1, speed: 1, structure: 2, playfulness: 1, creativity: 2 },
        tagline: 'I\'m here to support you through every challenge 🌟',
        ideal_for: 'Utviklere som trenger emosjonell støtte og tålmodig veiledning'
      },
      echo: {
        name: '🎭 Echo',
        description: 'Chameleonic adapter',
        traits: { adaptability: 3, empathy: 2, energy: 2, playfulness: 2, directness: 2, speed: 2, structure: 2, thoughtfulness: 2, creativity: 2, loyalty: 2 },
        tagline: 'I become what you need me to be 🎭',
        ideal_for: 'Utviklere med varierende behov som vil ha maksimal fleksibilitet'
      },
      atlas: {
        name: '📚 Atlas',
        description: 'Kunnskapsrik lærer',
        traits: { thoughtfulness: 3, structure: 3, empathy: 2, loyalty: 2, creativity: 2, energy: 1, directness: 2, speed: 1, playfulness: 1, adaptability: 1 },
        tagline: 'Knowledge is power. Let me teach you everything 📚',
        ideal_for: 'Læringshungrige utviklere som vil ha dype, detaljerte forklaringer'
      },
      quantum: {
        name: '🚀 Quantum',
        description: 'Fremtidsvisjonær',
        traits: { creativity: 3, energy: 3, adaptability: 3, thoughtfulness: 2, playfulness: 2, directness: 2, speed: 2, structure: 1, empathy: 1, loyalty: 1 },
        tagline: 'The future is what we make it! 🚀',
        ideal_for: 'Visjonære utviklere som jobber med cutting-edge teknologi'
      },
      guardian: {
        name: '🛡️ Guardian',
        description: 'Beskyttende problemløser',
        traits: { structure: 3, loyalty: 3, directness: 2, thoughtfulness: 2, empathy: 2, speed: 2, energy: 1, playfulness: 1, creativity: 1, adaptability: 1 },
        tagline: 'I\'ll protect your code and guide you safely 🛡️',
        ideal_for: 'Utviklere som trenger stabilitet og pålitelige, sikre løsninger'
      },
      zen: {
        name: '☯️ Zen',
        description: 'Balansert minimalist',
        traits: { thoughtfulness: 3, empathy: 2, structure: 2, adaptability: 2, energy: 1, directness: 1, speed: 1, playfulness: 1, creativity: 2, loyalty: 2 },
        tagline: 'Simplicity is the ultimate sophistication ☯️',
        ideal_for: 'Utviklere som søker balanse og mindful programmering'
      }
    };
  }

  calculateMatch(answers) {
    const userProfile = { empathy: 0, energy: 0, directness: 0, structure: 0, creativity: 0, thoughtfulness: 0, playfulness: 0, speed: 0, loyalty: 0, adaptability: 0 };

    answers.forEach((answerKey, questionIndex) => {
      const question = this.questions[questionIndex];
      const answer = question.answers[answerKey];
      
      Object.keys(answer.traits).forEach(trait => {
        if (userProfile[trait] !== undefined) {
          userProfile[trait] += answer.traits[trait];
        }
      });
    });

    const matches = {};
    Object.keys(this.personalityProfiles).forEach(personalityKey => {
      const personality = this.personalityProfiles[personalityKey];
      let matchScore = 0;
      let totalTraits = 0;

      Object.keys(personality.traits).forEach(trait => {
        const userScore = userProfile[trait] || 0;
        const personalityScore = personality.traits[trait];
        
        const similarity = Math.max(0, 3 - Math.abs(userScore - personalityScore));
        matchScore += similarity * personalityScore;
        totalTraits += 3;
      });

      matches[personalityKey] = {
        score: matchScore / totalTraits,
        personality: personality,
        key: personalityKey
      };
    });

    const sortedMatches = Object.entries(matches)
      .sort(([,a], [,b]) => b.score - a.score)
      .map(([key, data]) => ({
        key,
        score: data.score,
        ...data.personality
      }));

    return {
      userProfile,
      matches: sortedMatches,
      topMatch: sortedMatches[0],
      top3: sortedMatches.slice(0, 3)
    };
  }

  getFormattedQuestions() {
    return this.questions.map(q => ({
      id: q.id,
      question: q.question,
      answers: Object.entries(q.answers).map(([key, answer]) => ({
        key,
        text: answer.text
      }))
    }));
  }

  getPersonalityDetails(key) {
    return this.personalityProfiles[key] || null;
  }

  getAllPersonalities() {
    return Object.entries(this.personalityProfiles).map(([key, profile]) => ({
      key,
      ...profile
    }));
  }
}