function drawBackground() {
  // Approved dungeon artwork. It is scaled to fully cover the fixed 9:14
  // gameplay world without changing gameplay geometry.
  if (bgImage.complete && bgImage.naturalWidth > 0) {
    const imageRatio = bgImage.naturalWidth / bgImage.naturalHeight;
    const worldRatio = WORLD_WIDTH / WORLD_HEIGHT;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (imageRatio > worldRatio) {
      drawHeight = WORLD_HEIGHT;
      drawWidth = drawHeight * imageRatio;
      drawX = (WORLD_WIDTH - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = WORLD_WIDTH;
      drawHeight = drawWidth / imageRatio;
      drawX = 0;
      drawY = (WORLD_HEIGHT - drawHeight) / 2;
    }

    ctx.drawImage(
      bgImage,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    // Light darkening layer keeps mobs/bricks readable over the artwork.
    ctx.fillStyle = "rgba(7, 8, 12, 0.18)";
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else {
    ctx.fillStyle = "#1c1926";
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  // Retain subtle side boundaries for collision readability.
  ctx.fillStyle = "rgba(12, 12, 18, 0.30)";
  ctx.fillRect(0, 110, 28, WORLD_HEIGHT);
  ctx.fillRect(WORLD_WIDTH - 28, 110, 28, WORLD_HEIGHT);
}

function routeDoorInfo(type) {
  if (type === "hard") {
    return {
      icon: "🔥",
      label: "HARD",
      filter: "hue-rotate(135deg) saturate(1.65) brightness(.92)",
      detail: "TOUGHER ENEMIES"
    };
  }

  if (type === "treasure") {
    return {
      icon: "💰",
      label: "TREASURE",
      filter: "hue-rotate(205deg) saturate(1.7) brightness(1.08)",
      detail: "MORE TREASURE"
    };
  }

  if (type === "shop") {
    return {
      icon: "🛒",
      label: "SHOP",
      filter: "hue-rotate(70deg) saturate(1.55) brightness(.95)",
      detail: "SPEND GOLD"
    };
  }

  return {
    icon: "⚔️",
    label: "STANDARD",
    filter: "none",
    detail: "STANDARD ROOM"
  };
}

function drawExitChoice() {
  if (gameState !== "exitChoice") return;

  ctx.fillStyle =
    "rgba(7, 7, 10, .30)";

  ctx.fillRect(
    0,
    110,
    WORLD_WIDTH,
    1040
  );

  const doors =
    exitChoice.doors || [];

  for (const door of doors) {
    const node =
      routeSectionOne.nodes[
        door.nodeId
      ];

    if (!node) continue;

    const info =
      routeDoorInfo(
        node.type
      );

    drawDoor(
      door.x,
      door.y,
      door.w,
      door.h,
      info.icon,
      info.label,
      info.filter,
      info.detail
    );
  }

  let heroY =
    exitChoice.heroY;

  if (
    exitChoice.hopTimer > 0
  ) {
    const t =
      1 -
      exitChoice.hopTimer / 0.45;

    heroY -=
      Math.sin(
        t * Math.PI
      ) * 55;
  }

  drawHeroSprite(
    exitChoice.heroX,
    heroY,
    exitChoice.facing,
    0.92
  );
}

function drawDoor(x, y, w, h, icon, label, filter, detail = "") {
  ctx.save();
  if (doorImage.complete && doorImage.naturalWidth > 0) {
    ctx.filter = filter || "none";
    ctx.drawImage(doorImage, x, y, w, h);
    ctx.filter = "none";
  } else {
    ctx.strokeStyle="#ddd"; ctx.lineWidth=7; ctx.strokeRect(x,y,w,h);
  }
  ctx.textAlign="center"; ctx.shadowBlur=8; ctx.shadowColor="#000";
  const compact = w < 170;
  ctx.font = compact ? "bold 23px Arial" : "bold 30px Arial";
  ctx.fillStyle="#fff";
  ctx.fillText(icon,x+w/2,y+h-(compact?60:73));
  ctx.font = compact ? "bold 15px Arial" : "bold 20px Arial";
  ctx.fillText(label,x+w/2,y+h-(compact?37:45));
  ctx.font = compact ? "bold 8px Arial" : "bold 11px Arial";
  ctx.fillStyle="#eee5d4";
  ctx.fillText(detail,x+w/2,y+h-(compact?20:25));
  ctx.restore();
}

function drawRail() {
  const railY = player.y + 70;

  // Dark bed beneath the track.
  ctx.fillStyle = "rgba(10, 9, 12, .72)";
  ctx.fillRect(22, railY - 10, WORLD_WIDTH - 44, 70);

  // Wooden sleepers.
  for (let x = 25; x < WORLD_WIDTH - 25; x += 74) {
    ctx.fillStyle = "#5b3c29";
    ctx.fillRect(x, railY + 12, 50, 18);

    ctx.strokeStyle = "#2d2019";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, railY + 12, 50, 18);
  }

  // Twin metal rails.
  ctx.fillStyle = "#b5b1ad";
  ctx.fillRect(28, railY, WORLD_WIDTH - 56, 10);
  ctx.fillRect(28, railY + 36, WORLD_WIDTH - 56, 10);

  ctx.fillStyle = "#55525a";
  ctx.fillRect(28, railY + 8, WORLD_WIDTH - 56, 5);
  ctx.fillRect(28, railY + 44, WORLD_WIDTH - 56, 5);

  // Rail bolts.
  ctx.fillStyle = "#d0c9be";
  for (let x = 48; x < WORLD_WIDTH - 40; x += 74) {
    ctx.beginPath();
    ctx.arc(x, railY + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, railY + 41, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHunterArrow(){
  if(gameState==="exitChoice"||gameState==="postRewardShake")return;
  const cd=rangerSkill.effectiveCooldown||rangerSkill.cooldown;
  const amt=rangerSkill.timer<=0?1:Math.max(0,1-rangerSkill.timer/cd);
  if(amt<=.02)return;
  const facing=player.facing>=0?1:-1;
  const x=player.x+facing*player.width*.38, y=player.y-44;
  const ready=rangerSkill.timer<=0;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=ready?1:.1+amt*.72;
  ctx.strokeStyle=ready?"#fff1a8":"#a69e90";ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=4;
  if(ready){ctx.shadowBlur=20;ctx.shadowColor="#70e8ff";}
  ctx.beginPath();ctx.moveTo(0,24);ctx.lineTo(0,-24);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(-8,-18);ctx.lineTo(8,-18);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(0,21);ctx.lineTo(-7,31);ctx.lineTo(0,27);ctx.lineTo(7,31);ctx.closePath();ctx.fill();
  ctx.restore();
}

function drawHunterDodgeReady() {
  if (
    gameState !== "playing" &&
    gameState !== "waiting"
  ) return;

  const ready =
    hunterDodge.timer <= 0;

  const progress =
    ready
      ? 1
      : Math.max(
          0,
          1 - hunterDodge.timer / hunterDodge.cooldown
        );

  if (progress <= 0.03) return;

  // Aura hugs the hero, not the trolley.
  const auraX = player.x;
  const auraY = player.y - 104;

  ctx.save();

  const pulse =
    0.45 +
    Math.sin(performance.now() / 150) * 0.10;

  ctx.globalAlpha =
    ready
      ? pulse
      : 0.05 + progress * 0.18;

  ctx.strokeStyle = "#fff1a8";
  ctx.shadowBlur = ready ? 18 : 6;
  ctx.shadowColor = "#fff1a8";
  ctx.lineWidth = ready ? 4 : 2;

  ctx.beginPath();
  ctx.ellipse(
    auraX,
    auraY,
    34,
    49,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.restore();
}


function drawMountedHeroImage(image, sx, sy, sw, sh, dx, dy, dw, dh, mountedIdle, backFrame) {
  if (mountedIdle) {
    ctx.drawImage(
      heroSpriteSheetImage,
      backFrame.x,
      backFrame.y,
      backFrame.w,
      backFrame.h,
      dx,
      dy,
      dw,
      dh
    );
    return;
  }

  ctx.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    dx,
    dy,
    dw,
    dh
  );
}

function drawPlayer() {
  let x = player.x;
  let y = player.y;

  if (gameState === "postRewardShake") {
    x += Math.sin(performance.now() * 0.022) * 8;
    y += Math.cos(performance.now() * 0.028) * 2;
  }

  ctx.save();
  if (player.slowTimer > 0 && player.slowStacks > 0) {
    const tintByStack = [
      "none",
      "hue-rotate(145deg) saturate(1.7) brightness(1.18)",
      "hue-rotate(155deg) saturate(2.3) brightness(1.30)",
      "hue-rotate(165deg) saturate(3.0) brightness(1.48)"
    ];
    ctx.filter = tintByStack[Math.min(3, player.slowStacks)];
  }

  if (player.stunTimer > 0) {
    ctx.filter = "sepia(.8) saturate(2.2) brightness(1.35)";
  }


  if (
    player.invincibleTimer > 0 &&
    Math.floor(player.invincibleTimer * 15) % 2 === 0
  ) {
    ctx.globalAlpha = 0.45;
  }

  // Shield is drawn in world space and should never visually mirror.
  if (shieldReady || shieldShatterTimer > 0) {
    const alpha = shieldReady
      ? 0.85
      : Math.max(0, shieldShatterTimer / 0.55);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#69d0ff";
    ctx.lineWidth = shieldReady ? 9 : 4;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - 22,
      player.width / 2 + 44,
      106,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.12;
    ctx.fillStyle = "#69d0ff";
    ctx.fill();
    ctx.restore();
  }

  // Mirror the mounted assembly based on the trolley's last movement direction.
  const facing = player.facing >= 0 ? 1 : -1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  const trolleyW = player.width * 1.24;
  const trolleyH = player.height * 1.55;

  if (trolleyBodyImage.complete && trolleyBodyImage.naturalWidth > 0) {
    ctx.drawImage(
      trolleyBodyImage,
      -trolleyW / 2,
      -trolleyH * 0.48,
      trolleyW,
      trolleyH
    );
  } else {
    ctx.fillStyle = "#76523c";
    ctx.fillRect(-player.width / 2, -20, player.width, 40);
  }

  // Hero is deliberately much closer to the trolley deck now.
  // When the trolley is stationary, the hero faces UP / away from camera.
  // Moving left/right keeps the directional combat pose.
  if (gameState !== "exitChoice") {
    const mountedIdle =
      Math.abs(player.velocityX || 0) < 8 &&
      player.hp >= player.maxHp &&
      heroSpriteSheetImage.complete &&
      heroSpriteSheetImage.naturalWidth > 0;

    const mountedBackFrame =
      heroSpriteAtlas.walkBack[0];

    const mountedHeroImage =
      mountedIdle
        ? heroSpriteSheetImage
        : heroImage;

    const heroH = 92;
    const heroW =
      mountedIdle
        ? heroH *
          (
            mountedBackFrame.w /
            mountedBackFrame.h
          )
        : (
            mountedHeroImage.naturalHeight > 0
              ? heroH *
                (
                  mountedHeroImage.naturalWidth /
                  mountedHeroImage.naturalHeight
                )
              : 58
          );

    if (
      mountedHeroImage.complete &&
      mountedHeroImage.naturalWidth > 0
    ) {
      const heroX = -heroW / 2;
      const heroY = -trolleyH * 0.36 - heroH + 8;

      const hpRatio =
        player.maxHp > 0
          ? Math.max(0, Math.min(1, player.hp / player.maxHp))
          : 0;

      const fullColorHeight =
        heroH * hpRatio;

      const fadedHeight =
        heroH - fullColorHeight;

      // Draw depleted upper portion faded/desaturated.
      if (fadedHeight > 0) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.filter = "grayscale(1) brightness(.85)";
        drawMountedHeroImage(
          mountedHeroImage,
          0,
          0,
          mountedHeroImage.naturalWidth,
          mountedHeroImage.naturalHeight * (fadedHeight / heroH),
          heroX,
          heroY,
          heroW,
          fadedHeight,
          mountedIdle,
          mountedBackFrame
        );
        ctx.restore();
      }

      // Draw remaining HP from the bottom upward in full color.
      if (fullColorHeight > 0) {
        const sourceY =
          mountedHeroImage.naturalHeight *
          (1 - hpRatio);

        const sourceH =
          mountedHeroImage.naturalHeight *
          hpRatio;

        drawMountedHeroImage(
          mountedHeroImage,
          0,
          sourceY,
          mountedHeroImage.naturalWidth,
          sourceH,
          heroX,
          heroY + fadedHeight,
          heroW,
          fullColorHeight,
          mountedIdle,
          mountedBackFrame
        );
      }
    }
  }

  ctx.restore();
  ctx.restore();
}

const heroSpriteSheetImage = new Image();
heroSpriteSheetImage.src = "assets/hero_trolley_spritesheet.png";

/*
  Single-sheet navigation atlas.
  All frames are cropped directly from the existing sprite sheet,
  so no extra hero PNG files are required in /assets.
*/
const heroSpriteAtlas = {
  idle: [
    // HERO - IDLE, first front/neutral pose
    { x: 22, y: 40, w: 112, h: 160 }
  ],

  walkRight: [
    // HERO - WALK RIGHT row
    { x: 520, y: 48, w: 112, h: 154 },
    { x: 625, y: 48, w: 112, h: 154 },
    { x: 730, y: 48, w: 112, h: 154 },
    { x: 835, y: 48, w: 112, h: 154 },
    { x: 940, y: 48, w: 112, h: 154 }
  ],

  walkBack: [
    // HERO - BACK VIEW row
    { x: 1125, y: 445, w: 110, h: 155 },
    { x: 1265, y: 445, w: 110, h: 155 },
    { x: 1405, y: 445, w: 110, h: 155 }
  ]
};

function getHeroNavigationFrame() {
  const moveX =
    exitChoice.moveX || 0;

  const moveY =
    exitChoice.moveY || 0;

  const moving =
    Math.abs(moveX) > 0.08 ||
    Math.abs(moveY) > 0.08;

  if (!moving) {
    return {
      frame: heroSpriteAtlas.idle[0],
      flipX: exitChoice.facing < 0
    };
  }

  // UP = away from the camera / toward the dungeon.
  if (
    moveY < -0.20 &&
    Math.abs(moveY) >=
      Math.abs(moveX) * 0.55
  ) {
    const frames =
      heroSpriteAtlas.walkBack;

    const index =
      Math.floor(
        performance.now() / 145
      ) % frames.length;

    return {
      frame: frames[index],
      flipX: false
    };
  }

  const frames =
    heroSpriteAtlas.walkRight;

  const index =
    Math.floor(
      performance.now() / 120
    ) % frames.length;

  return {
    frame: frames[index],
    flipX: moveX < 0
  };
}

function drawHeroSprite(x, y, facing = 1, scale = 1) {
  if (
    heroSpriteSheetImage.complete &&
    heroSpriteSheetImage.naturalWidth > 0
  ) {
    const selection =
      getHeroNavigationFrame();

    const frame =
      selection.frame;

    const drawH =
      118 * scale;

    const drawW =
      drawH *
      (frame.w / frame.h);

    ctx.save();
    ctx.translate(x, y);

    if (selection.flipX) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      heroSpriteSheetImage,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      -drawW / 2,
      -drawH,
      drawW,
      drawH
    );

    ctx.restore();
    return;
  }

  if (
    typeof heroImage !== "undefined" &&
    heroImage.complete &&
    heroImage.naturalWidth > 0
  ) {
    const h = 118 * scale;
    const w =
      h *
      (
        heroImage.naturalWidth /
        heroImage.naturalHeight
      );

    ctx.save();
    ctx.translate(x, y);

    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      heroImage,
      -w / 2,
      -h,
      w,
      h
    );

    ctx.restore();
    return;
  }

  ctx.fillStyle = "#4f7bc4";
  ctx.fillRect(x - 18, y - 50, 36, 60);
}

function drawDriver(x, y) {
  const runAmount = Math.sin(player.runTimer) * 12;
  const bodyY = y - 32;

  ctx.fillStyle = "#e1b58d";
  ctx.beginPath();
  ctx.arc(x, bodyY - 32, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d7d9df";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x, bodyY - 16);
  ctx.lineTo(x, bodyY + 18);
  ctx.stroke();

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x, bodyY - 5);
  ctx.lineTo(x + 25 * player.facing, bodyY + 3);
  ctx.stroke();

  ctx.strokeStyle = "#6e86ad";
  ctx.lineWidth = 8;

  ctx.beginPath();
  ctx.moveTo(x, bodyY + 15);
  ctx.lineTo(x - runAmount, bodyY + 43);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, bodyY + 15);
  ctx.lineTo(x + runAmount, bodyY + 43);
  ctx.stroke();
}

function drawBall() {
  if (progression.equipment.ball === "cinder") {
    ctx.save();

    const glow = ctx.createRadialGradient(
      ball.x,
      ball.y,
      2,
      ball.x,
      ball.y,
      ball.radius * 2.3
    );
    glow.addColorStop(0, "rgba(255, 244, 155, 1)");
    glow.addColorStop(.38, "rgba(255, 135, 45, .95)");
    glow.addColorStop(1, "rgba(255, 60, 20, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffb33e";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff1a8";
    ctx.beginPath();
    ctx.arc(ball.x - 4, ball.y - 5, ball.radius * .45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  ctx.fillStyle = ballStuck ? "#ffe892" : "#f4e9c8";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = ballStuck ? "#f2c85c" : "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawMobImage(image, brick, scaleX = 1, scaleY = 1, yOffset = 0) {
  if (!(image.complete && image.naturalWidth > 0)) return false;

  const targetW = brick.width * scaleX;
  const targetH = brick.height * scaleY;

  const imageRatio =
    image.naturalWidth / image.naturalHeight;

  const targetRatio =
    targetW / targetH;

  let drawW;
  let drawH;

  if (imageRatio > targetRatio) {
    drawW = targetW;
    drawH = targetW / imageRatio;
  } else {
    drawH = targetH;
    drawW = targetH * imageRatio;
  }

  ctx.drawImage(
    image,
    brick.x + brick.width / 2 - drawW / 2,
    brick.y + brick.height / 2 - drawH / 2 + yOffset,
    drawW,
    drawH
  );

  return true;
}

function drawMobBacking(brick){
  if(!brick.isMob)return;
  ctx.save();
  ctx.globalAlpha=.24;ctx.fillStyle="#73777d";
  ctx.fillRect(brick.x+3,brick.y+3,brick.width-6,brick.height-6);
  ctx.globalAlpha=.16;ctx.strokeStyle="#c0c4c9";ctx.lineWidth=2;
  ctx.strokeRect(brick.x+3,brick.y+3,brick.width-6,brick.height-6);
  ctx.restore();
}

function drawEnemyAura(brick) {
  if (!brick.isMob) return;
  let c=null;
  if (brick.iceGoblin) c="#73ddff";
  else if (brick.stunGoblin) c="#ffe35b";
  else if (brick.darkFireGoblin || brick.fireGoblin) c="#ff674d";
  else if (brick.greenGoblin) c="#75e66b";
  if (!c) return;
  ctx.save();
  ctx.globalAlpha=.42+Math.sin(performance.now()/180+brick.x*.01)*.14;
  ctx.strokeStyle=c; ctx.shadowBlur=20; ctx.shadowColor=c; ctx.lineWidth=5;
  ctx.strokeRect(brick.x+4,brick.y+4,brick.width-8,brick.height-8);
  ctx.restore();
}

function drawBricks(dt) {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    if (brick.hitFlash > 0) brick.hitFlash -= dt;

    const ratio = brick.hp / brick.maxHp;

    if (brick.isMob && gobImage.complete && gobImage.naturalWidth > 0) {
      drawMobBacking(brick);
      drawEnemyAura(brick);
      ctx.save();

      // Shooter goblins get a red hue shift so gob1.png can serve as
      // the first reusable mob block asset.
      if (brick.telegraph > 0 && Math.floor(brick.telegraph * 16) % 2 === 0) {
        ctx.filter = "brightness(2.1) saturate(.35)";
      } else if (brick.raiderBoss) {
        ctx.filter = brick.armor > 0
          ? "grayscale(.45) brightness(.82) contrast(1.25)"
          : "none";
      } else if (brick.stunGoblin) {
        ctx.filter = "hue-rotate(48deg) saturate(2.1) brightness(1.2)";
      } else if (brick.darkFireGoblin) {
        ctx.filter = "hue-rotate(320deg) saturate(2) brightness(.66)";
      } else if (brick.fireGoblin || brick.shooter) {
        ctx.filter = "hue-rotate(300deg) saturate(1.8) brightness(.95)";
      } else if (brick.iceGoblin) {
        ctx.filter = "hue-rotate(145deg) saturate(1.45) brightness(1.14)";
      } else if (brick.greenGoblin) {
        // Keep green family close to the source sprite for now.
        ctx.filter = "hue-rotate(12deg) saturate(1.15) brightness(1.02)";
      } else {
        // Neutral/grey grunt.
        ctx.filter = "grayscale(.92) brightness(.88) contrast(1.15)";
      }

      if (brick.hitFlash > 0) {
        ctx.globalAlpha = 0.55;
      }

      if (brick.raiderBoss) {
        // Keep the Raider's visible height, but fit it naturally inside the
        // same cell instead of stretching the source art sideways.
        drawMobImage(
          raiderImage,
          brick,
          1.0,
          1.18,
          -2
        );
      } else {
        drawMobImage(
          gobImage,
          brick,
          1.16,
          1.20,
          -3
        );
      }

      ctx.restore();

      if (brick.hitFlash > 0) {
        ctx.fillStyle = "rgba(255,255,255,.42)";
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
    } else if (brick.treasure) {
      const damaged = brick.hp <= brick.maxHp * 0.5;
      const img = damaged ? brick2Image : brick1Image;
      ctx.save();
      ctx.filter = "hue-rotate(35deg) saturate(1.9) brightness(1.18)";
      if (brick.hitFlash > 0) ctx.globalAlpha = 0.65;
      if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, brick.x, brick.y, brick.width, brick.height);
      else { ctx.fillStyle="#c79d31"; ctx.fillRect(brick.x,brick.y,brick.width,brick.height); }
      ctx.restore();
    } else {
      const damaged = brick.hp <= brick.maxHp * 0.5;
      const img = damaged ? brick2Image : brick1Image;

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();

        if (brick.hitFlash > 0) {
          ctx.globalAlpha = 0.62;
        }

        ctx.drawImage(
          img,
          brick.x,
          brick.y,
          brick.width,
          brick.height
        );

        ctx.restore();

        if (brick.hitFlash > 0) {
          ctx.fillStyle = "rgba(255,255,255,.38)";
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
      } else {
        ctx.fillStyle = damaged ? "#7b3f31" : "#b35042";
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
    }

    if (brick.raiderBoss && brick.armor > 0) {
      ctx.save();
      const pulse = 0.78 + Math.sin(performance.now() * 0.006) * 0.10;

      ctx.globalAlpha = pulse;
      ctx.strokeStyle = "#aeb4bb";
      ctx.lineWidth = 7;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#9299a1";

      ctx.strokeRect(
        brick.x - 7,
        brick.y - 9,
        brick.width + 14,
        brick.height + 18
      );

      ctx.globalAlpha = 0.09;
      ctx.fillStyle = "#c5c9cd";
      ctx.fillRect(
        brick.x - 5,
        brick.y - 7,
        brick.width + 10,
        brick.height + 14
      );

      ctx.restore();
    }

    if (brick.maxHp > 1) {
      ctx.fillStyle = "#251d26";
      ctx.fillRect(
        brick.x + 10,
        brick.y + brick.height - 14,
        brick.width - 20,
        7
      );

      ctx.fillStyle = brick.isMob
        ? "#e45757"
        : brick.treasure
          ? "#ffe77c"
          : "#bcae9b";

      ctx.fillRect(
        brick.x + 10,
        brick.y + brick.height - 14,
        (brick.width - 20) * ratio,
        7
      );
    }
  }
}
function drawProjectiles() {
  for (const shot of enemyProjectiles) {
    ctx.save();

    if (shot.type === "arrow") {
      ctx.translate(shot.x, shot.y);
      ctx.rotate(shot.angle || Math.atan2(shot.vy, shot.vx));
      ctx.strokeStyle = "#d7c6a1";
      ctx.fillStyle = "#d7c6a1";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(7, -7);
      ctx.lineTo(7, 7);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle =
        shot.type === "ice"
          ? "#91e9ff"
          : shot.type === "stun"
            ? "#ffe15a"
            : "#ff5d4c";
      ctx.shadowBlur = 14;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);

    if (p.text) {
      ctx.fillStyle = p.color;
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,.88)";
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = "start";
}

