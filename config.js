const form = document.getElementById("form");
const numberInput = document.getElementById("number");
const output = document.getElementById("output");

async function showMyCaptcha() {
  return new Promise((resolve, reject) => {
    const container = document.querySelector("#my-captcha-container");

    AwsWafCaptcha.renderCaptcha(container, {
      apiKey: window.WAF_API_KEY,
      onSuccess: (wafToken) => {
        console.log("Captcha résolu avec succès:", wafToken);
        resolve(wafToken); // Continue après que le Captcha soit résolu
      },
      onError: (error) => {
        console.error("Erreur Captcha:", error);
        reject(error); // Gérez les erreurs du Captcha
      },
    });
  });
}

window.WAF_API_KEY = 'QFYeykBdQKdBtLhvHuK+hlH19ZxKrOLx3L6WUx+qRpfh9vMYAJdYb2oxcpE5KTBfEhmqrrhEvRVeODIZAQEnIOTQqqG/j6FUGLohcKveATIuOWDePxGmPOdcu4NLMCWwCg8dGdatkqKZlUhos2yl3DGIuUL4JVhlpmvPN5Li8WUQXFptUmZqBZupowmVQ+Sb82O/zdObyaLVdjNnlXe02zWpeepFsOxUqk2nVJGN0RCEgH+OG8t5bdeLm4lKFoBQa4wAh5oVpJ8ErwhZNgdkLKqbwYX4cUGWHtOAcjRYcY1wxY/T8CXm6TG3tRwqbWmdGN0jvg9rVqpSPTFI7uwyVDxTtP5PAMBqMh4OZbwbidupU2OAw8wMGiHVj67ekOMI6dfq+7rZq/QcQJYjsEzMMNeA6hkj0Em8f8GUCpSIhSmPcgTqGt/bi3g/bkSwkNNaYQnu+X0GYKHH/fm88SJHUKVxvMb4TFBi7PDTDFH0qoXrbd4Z25D1mveDTjO0D65McMVwyg5CQlifCfGDmlSTSpgEHJ3uRPSYeF6ueJo8JGufYRv9HwAd1zKyHsASV2DmYT/p9dXFrNRqp9OmYM1lmqjdwLLibJ5mKF28B1Ku2sDg93UM1CBTgsDw9lsXOmccYSzVHUfbUL8C+qUJZ1cDZP34kEwbt/q+f9eWtD26vzQ=_0_1';

/**
 * Fonction principale pour gérer la soumission du formulaire et les appels API
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const N = parseInt(numberInput.value);

  // Validation de l'entrée
  if (isNaN(N) || N < 1 || N > 1000) {
    alert("Veuillez entrer un nombre valide.");
    return;
  }

  // Masquer le formulaire et commencer la séquence
  form.style.display = "none";
  for (let i = 1; i <= N; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = `${i}. Forbidden`;
    output.appendChild(listItem);

    try {
      const response = await fetch("https://api.prod.jcloudify.com/whoami");

      if (response.status === 403) {
        listItem.textContent = `${i}. Forbidden`;
      } else if (response.status === 405) {
        // Captcha détecté
        alert("Captcha détecté. Veuillez résoudre le captcha pour continuer.");
        await showMyCaptcha(); // Attendre que le Captcha soit résolu
        i--; // Réessayer la même requête après la résolution du Captcha
      }else {
        listItem.textContent = `${i}. Error`;
      }
    } catch (error) {
      listItem.textContent = `${i}. Network error`;
    }

    // Attendre 1 seconde avant la prochaine requête
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
