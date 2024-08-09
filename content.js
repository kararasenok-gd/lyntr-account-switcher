(function () {
    const container = document.getElementById('container');
    const accountList = document.getElementById('accountList');
    const addAccountButton = document.getElementById('addAccountButton');
    const addThisAccountButton = document.getElementById('addThisAccountButton');
    const accountSettings = document.getElementById('accountSettings');
    const accountDisplayNameInput = document.getElementById('accountDisplayName');
    const accountTokenInput = document.getElementById('accountToken');
    const accountSettingsSubmit = document.getElementById('accountSettingsSubmit');
    const deleteAccountButton = document.getElementById('deleteAccountButton');
    let currentEditIndex = null;
    let currentToken = null;

    function fetchCurrentToken(callback) {
        chrome.cookies.get({ url: 'https://lyntr.com', name: '_TOKEN__DO_NOT_SHARE' }, (cookie) => {
            if (cookie) {
                currentToken = cookie.value;
                callback();
            } else {
                callback();
                console.log('Token not found!');
                callback();
            }
        });
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
        if (!arrayOfTabs[0].url.startsWith('https://lyntr.com')) {
            container.innerHTML = `<h1>FIRSTLY OPEN LYNTR</h1>`;
            throw new Error('Lyntr is not open');
        }
    });

    function updateAccountList() {
        accountList.innerHTML = '';
        const accounts = JSON.parse(localStorage.getItem('lyntrAccounts')) || [];
        accounts.forEach((account, index) => {
            const accountDiv = document.createElement('div');
            const selectButton = document.createElement('button');
            let currentAccount = false;
            if (account.token === currentToken) {
                accountDiv.classList.add('currentAccount');
                currentAccount = true;
            }
            selectButton.textContent = 'Select';
            selectButton.onclick = () => selectAccount(index);
            selectButton.disabled = currentAccount;
            accountDiv.textContent = account.displayName + ' ';

            accountDiv.appendChild(selectButton);

            const settingsButton = document.createElement('button');
            settingsButton.textContent = '⚙️';
            settingsButton.onclick = () => openAccountSettings(index);
            accountDiv.appendChild(settingsButton);

            accountList.appendChild(accountDiv);
        });
    }

    addAccountButton.onclick = () => {
        const accounts = JSON.parse(localStorage.getItem('lyntrAccounts')) || [];
        accounts.push({ displayName: '', token: '' });
        localStorage.setItem('lyntrAccounts', JSON.stringify(accounts));
        currentEditIndex = accounts.length - 1;
        openAccountSettings(currentEditIndex, false);
        openAccountSettings(currentEditIndex, false);
    };

    addThisAccountButton.onclick = () => {
        chrome.cookies.get({ url: 'https://lyntr.com', name: '_TOKEN__DO_NOT_SHARE' }, (cookie) => {
            if (cookie) {
                const token = cookie.value;
                const accounts = JSON.parse(localStorage.getItem('lyntrAccounts')) || [];
                accounts.push({ displayName: '', token });
                localStorage.setItem('lyntrAccounts', JSON.stringify(accounts));
                currentEditIndex = accounts.length - 1;
                openAccountSettings(currentEditIndex, true);
                openAccountSettings(currentEditIndex, true);
            } else {
                alert('Token not found!');
            }
        });
    };

    function selectAccount(index) {
        const accounts = JSON.parse(localStorage.getItem('lyntrAccounts'));
        const selectedAccount = accounts[index];
        chrome.cookies.set({ url: 'https://lyntr.com', name: '_TOKEN__DO_NOT_SHARE', value: selectedAccount.token }, () => {
            alert(`Account ${selectedAccount.displayName} selected!\n\nIf something broken, try reload page again. If it still doesn't work, report a bug here: https://github.com/kararasenok-gd/lyntr-account-switcher/issues`);
            window.location.reload();
            chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) { chrome.tabs.reload(arrayOfTabs[0].id); });
        });
    }

    function openAccountSettings(index, isThisAccount) {
        const accounts = JSON.parse(localStorage.getItem('lyntrAccounts'));
        currentEditIndex = index;
        if (isThisAccount) {
            accountDisplayNameInput.value = '';
        } else {
            accountDisplayNameInput.value = accounts[index].displayName; 
        }
        accountTokenInput.value = accounts[index].token;
        accountSettings.style.display = 'block';
    }

    accountSettingsSubmit.onclick = () => {
        const accounts = JSON.parse(localStorage.getItem('lyntrAccounts'));
        accounts[currentEditIndex].displayName = accountDisplayNameInput.value;
        accounts[currentEditIndex].token = accountTokenInput.value;
        localStorage.setItem('lyntrAccounts', JSON.stringify(accounts));
        accountSettings.style.display = 'none';
        updateAccountList();
    };

    deleteAccountButton.onclick = () => {
        const accounts = JSON.parse(localStorage.getItem('lyntrAccounts'));
        accounts.splice(currentEditIndex, 1);
        localStorage.setItem('lyntrAccounts', JSON.stringify(accounts));
        accountSettings.style.display = 'none';
        updateAccountList();
    };

    fetchCurrentToken(updateAccountList);

})();

document.getElementById('accountTokenShow').addEventListener('change', function () {
    if (this.checked) {
        document.getElementById('accountToken').type = 'text';
    } else {
        document.getElementById('accountToken').type = 'password';
    }
})

const currentVersion = 'v0.0.2';

document.getElementById('version').innerHTML = currentVersion;

fetch("https://raw.githubusercontent.com/kararasenok-gd/lyntr-account-switcher/main/ver").then((response) => {
    return response.text();
}).then((text) => {
    console.log(text, currentVersion);
    if (currentVersion !== text) {
        const message = "New version available! Would you like to update?";
        if (confirm(message)) {
            window.open("https://github.com/kararasenok-gd/lyntr-account-switcher/releases/latest");
        }
    }
})