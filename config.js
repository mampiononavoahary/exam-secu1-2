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


/**
 * Fonction principale pour gérer la soumission du formulaire et les appels API
 */

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const N = parseInt(numberInput.value);

  if (isNaN(N) || N < 1 || N > 1000) {
    alert("Veuillez entrer un nombre valide.");
    return;
  }

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
        let captchaResolved = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!captchaResolved && retryCount < maxRetries) {
          retryCount++;
          alert("Captcha détecté. Veuillez résoudre le captcha pour continuer.");
          await showMyCaptcha();
          const retryResponse = await fetch("https://api.prod.jcloudify.com/whoami");
          if (retryResponse.status === 403) {
            listItem.textContent = `${i}. Forbidden`;
            captchaResolved = true;
          }
        }

        if (retryCount >= maxRetries) {
          alert("Trop de tentatives de captcha échouées.");
          break;
        }
      } else {
        listItem.textContent = `${i}. Error`;
      }
    } catch (error) {
      listItem.textContent = `${i}. Network error`;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});

