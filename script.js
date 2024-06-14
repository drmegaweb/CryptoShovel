let coins = 0;
let energy = 6000;
let maxEnergy = 6000; // Adding a variable for maximum energy
let level = 1;
let tapProfit = 1; // Initial profit per click
let bonusPoints = 0;
const coinsPerTap = 100; // Number of coins awarded per tap
const energyPerTap = -1; // Energy spent per tap
const coinsForNextLevel = 1000;
let chanceMultiplier = 1.0;
let skinMultiplier = 1.0;
let skinImproved = false;

const levelNames = [
    "Beginner", "Experienced", "Skilled", "Adept", "Master",
    "Expert", "Virtuoso", "Legend", "Mythical", "Epic"
];

function increaseEnergy() {
    if (energy < maxEnergy) {
        energy += 3;
        updateUI();
    }
}

setInterval(increaseEnergy, 1000);

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const firstName = urlParams.get('first_name') || 'User';
    const avatarUrl = urlParams.get('avatar_url');

    document.getElementById('username').innerText = firstName;

    if (avatarUrl && avatarUrl.startsWith('https')) {
        document.getElementById('avatar').src = avatarUrl;
        document.getElementById('avatar').style.display = 'block'; // Show element if avatar is available
    } else {
        document.getElementById('avatar').style.display = 'none'; // Hide element if no avatar
    }
});


function updateUI() {
    document.getElementById('coins').innerText = coins;
    document.getElementById('energy').innerText = `${energy}/${maxEnergy}`;
    document.getElementById('level').innerText = `${level}/80`;
    document.getElementById('tapProfit').innerText = Math.floor(tapProfit * skinMultiplier); // Round down
    document.getElementById('hourlyProfit').innerText = `${Math.round(tapProfit * skinMultiplier * 60)}`;
    document.getElementById('upgradeCoins').innerText = `${coinsForNextLevel - (coins % coinsForNextLevel)}`;
    document.getElementById('bonusPoints').innerText = bonusPoints;

    const progressPercentage = (coins % coinsForNextLevel) / coinsForNextLevel * 100;
    document.getElementById('progress').style.width = `${progressPercentage}%`;

    const levelIndex = Math.min(Math.floor(level / 5), levelNames.length - 1);
    document.getElementById('levelname').innerText = levelNames[levelIndex];

    // Update boost button states
    const buttons = document.querySelectorAll('.boost-btn');
    buttons.forEach(button => {
        button.disabled = coins < 500; // Add coin availability check
    });

    document.querySelector('button[onclick="addEnergy()"]').disabled = coins < 1000;
    document.querySelector('button[onclick="increaseMaxEnergy()"]').disabled = coins < 2000;
    document.querySelector('button[onclick="increaseTapProfit()"]').disabled = coins < 5000;

    // Update shovel image
    document.getElementById('lopataImage').src = skinImproved ? 'img/shovel.png?v=3' : 'img/shovel2.png?v=3';
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = page.id === pageId ? 'flex' : 'none';
    });
    document.getElementById(pageId).style.flexDirection = 'column';

    const buttons = document.querySelectorAll('nav button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    const activeButton = document.getElementById(`${pageId}Button`);
    activeButton.classList.add('active');
}


function showTab(tabId) {
    const parentElement = document.getElementById('mine');
    const tabs = parentElement.querySelectorAll('.quests');
    tabs.forEach(tab => {
        tab.style.display = tab.id === tabId ? 'flex' : 'none';
    });

    const tabButtons = parentElement.querySelectorAll('button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    const activeButton = document.getElementById(tabId + 'Button');
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showTab('ore'); 
});

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showFloatingText(text, x, y, className) {
    const characterDiv = document.querySelector('.character-background');
    const floatingText = document.createElement('div');
    floatingText.className = className;
    floatingText.innerText = `+${text}`;
    const offsetX = Math.random() * 50;
    const offsetY = Math.random() * 50 - 50;
    floatingText.style.left = `${x + offsetX}px`;
    floatingText.style.top = `${y + offsetY}px`;
    characterDiv.appendChild(floatingText);

    setTimeout(() => {
        floatingText.style.opacity = '0';
        floatingText.style.transform = 'translateY(-100px)';
    }, 0);

    setTimeout(() => floatingText.remove(), 1000);
}

function handleTap(x, y) {

    const energyCost = Math.abs(energyPerTap);

    if (energy < energyCost) {
        showNotification('Not enough energy. Wait for a refill or go to UP.');
        return;
    }


    if (energy > 0) {
        const profit = Math.round(tapProfit * skinMultiplier); // Consider only tapProfit when calculating profit
        coins += profit;
        energy += energyPerTap;

        // Random chance of bonus points
        if (Math.random() < 0.1 * chanceMultiplier) {
            bonusPoints += 1;
            showFloatingText(1, x, y, 'bonus-text');
        } else {
            showFloatingText(profit, x, y, 'floating-text');
        }

        // Update level
        const newLevel = Math.floor(coins / coinsForNextLevel) + 1;
        if (newLevel !== level) level = newLevel;

        updateUI();
        updateUserData(userId, getUserDataObject());
    }
}

function updateUserData(userId, data) {
    console.log("Updating data for user ID:", userId, "with data:", data);
    return fetch(`/update_user_data.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => console.log("Data updated:", result))
        .catch(error => console.error("Error updating user data:", error));
}

function getUserDataObject() {
    return {
        user_id: userId,
        coins: Number(coins),
        energy: Number(energy),
        max_energy: Number(maxEnergy),
        level: Number(level),
        tap_profit: Number(tapProfit),
        bonus_points: Number(bonusPoints),
        chance_multiplier: Number(chanceMultiplier),
        skin_multiplier: Number(skinMultiplier),
        skin_improved: Boolean(skinImproved)
    };
}

function increaseChance() {
    if (coins >= 500) {
        coins -= 500;
        chanceMultiplier += 0.1;
        setTimeout(() => {
            chanceMultiplier -= 0.1;
            updateUI();
        }, 3600000); // 1 hour
        showNotification('You increased the drop chance by 10% for 1 hour.');
        updateUI();
    } else {
        showNotification('Not enough coins.');
    }
}

function improveSkin() {
    const upgradeCost = 500; // Example upgrade cost
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        skinMultiplier += 0.1;
        skinImproved = true;
        showNotification('You improved the shovel skin and increased the payout per click by 10%.');
        updateUI();
    } else {
        showNotification('Not enough coins.');
    }
}

function addEnergy() {
    const upgradeCost = 1000; // Upgrade cost
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        energy = maxEnergy; // Reset energy to max value
        showNotification('Energy restored to maximum value.');
        updateUI();
    } else {
        showNotification('Not enough coins.');
    }
}

function increaseMaxEnergy() {
    const upgradeCost = 2000; // Upgrade cost
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        maxEnergy += 1000; // Increase max energy by 1000
        energy = maxEnergy; // Update current energy to new max
        showNotification('Maximum energy increased by 1000.');
        updateUI();
    } else {
        showNotification('Not enough coins.');
    }
}

function increaseTapProfit() {
    const upgradeCost = 5000; // Upgrade cost
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        tapProfit += 10; // Increase tapProfit by 10
        showNotification('Profit per tap increased by 10.');
        updateUI();
    } else {
        showNotification('Not enough coins.');
    }
}

async function getUserData(userId) {
    console.log("Requesting user data for user ID:", userId); // Debug message
    try {
        const response = await fetch(`/get_user_data.php?user_id=${userId}`);
        console.log("Response status:", response.status); // Log response status
        const data = await response.json();
        console.log("Received user data:", data); // Debug message
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
console.log("User ID from URL:", userId); // Log User ID from URL

if (userId) {
    getUserData(userId).then(data => {
        if (data) {
            coins = Number(data.coins);
            energy = Number(data.energy);
            maxEnergy = Number(data.max_energy);
            level = Number(data.level);
            tapProfit = Number(data.tap_profit);
            bonusPoints = Number(data.bonus_points);
            chanceMultiplier = Number(data.chance_multiplier);
            skinMultiplier = Number(data.skin_multiplier);
            skinImproved = Boolean(data.skin_improved);
            updateUI();
        }
    });
}

window.addEventListener('beforeunload', () => {
    if (userId) {
        updateUserData(userId, getUserDataObject());
    }
});

document.getElementById('lopataImage').addEventListener('click', (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    handleTap(x, y);
});

document.getElementById('lopataImage').addEventListener('touchstart', (event) => {
    event.preventDefault();
    for (const touch of event.touches) {
        const rect = event.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        handleTap(x, y);
    }
}, { passive: false });
