(function () {
  "use strict";

  function closestField(element) {
    return element ? element.closest(".vgm-field") : null;
  }

  function setInvalid(element, invalid) {
    var field = closestField(element);
    if (!field) return;
    field.classList.toggle("is-invalid", invalid);
  }

  function validateContactForm(form) {
    var fields = form.querySelectorAll("[required]");
    var firstInvalid = null;
    var valid = true;

    fields.forEach(function (field) {
      var invalid = !field.checkValidity();
      setInvalid(field, invalid);
      if (invalid && !firstInvalid) firstInvalid = field;
      valid = valid && !invalid;
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    return valid;
  }

  function initContactForms() {
    document.querySelectorAll(".vgm-contact-form").forEach(function (form) {
      var submit = form.querySelector(".vgm-submit");
      var submitText = submit ? submit.querySelector("span") : null;
      var originalText = submitText ? submitText.textContent : "";
      var replyTo = form.querySelector('input[name="_replyto"]');
      var email = form.querySelector('input[name="email"]');

      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.addEventListener("input", function () {
          if (closestField(field) && closestField(field).classList.contains("is-invalid")) {
            setInvalid(field, !field.checkValidity());
          }
        });

        field.addEventListener("invalid", function () {
          setInvalid(field, true);
        });
      });

      form.addEventListener("submit", function (event) {
        if (!validateContactForm(form)) {
          event.preventDefault();
          return;
        }

        if (replyTo && email) {
          replyTo.value = email.value.trim();
        }

        if (submit) {
          submit.disabled = true;
          if (submitText) submitText.textContent = form.dataset.sending || originalText;
        }
      });
    });
  }

  function initPortfolioText() {
    var player = document.getElementById("portfolio-player");
    if (!player) return;

    var descriptions = window.vgmPortfolioDescriptions || [];
    var descriptionNode = document.getElementById("portfolio-description");
    var dots = document.querySelectorAll(".portfolio-dots button");

    function syncDescription() {
      if (!descriptionNode || !descriptions.length) return;
      var activeIndex = 0;
      dots.forEach(function (dot, index) {
        if (dot.classList.contains("active")) activeIndex = index;
      });
      descriptionNode.textContent = descriptions[activeIndex] || descriptions[0];
    }

    document.addEventListener("click", function (event) {
      if (event.target.closest(".portfolio-arrow") || event.target.closest(".portfolio-dots button")) {
        window.setTimeout(syncDescription, 0);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        window.setTimeout(syncDescription, 0);
      }
    });

    var surface = document.querySelector(".portfolio-video");
    if (surface) {
      surface.addEventListener("touchend", function () {
        window.setTimeout(syncDescription, 0);
      }, { passive: true });
    }

    syncDescription();
  }

  async function initLegacyOrbitStage() {
    var canvases = document.querySelectorAll("[data-vgm-3d]");
    if (!canvases.length) return;

    let THREE;
    try {
      THREE = await import("https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.min.js");
    } catch (error) {
      canvases.forEach(function (canvas) {
        canvas.parentElement.classList.add("is-fallback");
      });
      return;
    }

    canvases.forEach(function (canvas) {
      var scene = new THREE.Scene();
      var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      });

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
      if (renderer.toneMapping !== undefined && THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
      }

      var isHero = canvas.dataset.vgmVariant === "hero";
      var camera = new THREE.PerspectiveCamera(isHero ? 27 : 31, 1, 0.1, 100);
      camera.position.set(0, isHero ? 0.06 : 0.02, isHero ? 5.45 : 5.05);

      var group = new THREE.Group();
      group.scale.setScalar(isHero ? 1.16 : 0.98);
      scene.add(group);

      var darkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x061817,
        metalness: 0.42,
        roughness: 0.32,
        clearcoat: 0.62,
        clearcoatRoughness: 0.18
      });

      var glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8ff0d8,
        metalness: 0.02,
        roughness: 0.12,
        transparent: true,
        opacity: 0.48,
        transmission: 0.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide
      });

      var ivoryMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf4f1e8,
        metalness: 0.12,
        roughness: 0.24,
        clearcoat: 0.48,
        clearcoatRoughness: 0.16
      });

      var seaMaterial = new THREE.MeshStandardMaterial({
        color: 0x63e6c4,
        metalness: 0.58,
        roughness: 0.18,
        emissive: 0x0b5c51,
        emissiveIntensity: 0.16
      });

      var skyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8fe8e3,
        metalness: 0.36,
        roughness: 0.22,
        emissive: 0x073c39,
        emissiveIntensity: 0.1
      });

      var sageMaterial = new THREE.MeshStandardMaterial({
        color: 0x4f8f78,
        metalness: 0.3,
        roughness: 0.4
      });

      var aperture = new THREE.Group();
      group.add(aperture);

      var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.9, 0.18, 96), darkMaterial);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = -0.08;
      aperture.add(lens);

      var glassDisc = new THREE.Mesh(new THREE.CircleGeometry(0.82, 96), glassMaterial);
      glassDisc.position.z = 0.035;
      aperture.add(glassDisc);

      var outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.022, 18, 180), seaMaterial);
      outerRing.rotation.z = -0.18;
      aperture.add(outerRing);

      var innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.014, 14, 150), skyMaterial);
      innerRing.rotation.z = 0.36;
      aperture.add(innerRing);

      var ribbon = new THREE.Mesh(new THREE.TorusKnotGeometry(0.54, 0.011, 120, 8, 2, 3), seaMaterial);
      ribbon.rotation.set(0.9, 0.26, -0.34);
      aperture.add(ribbon);

      var center = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 2), glassMaterial);
      center.rotation.set(0.4, 0.2, 0.78);
      aperture.add(center);

      var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), ivoryMaterial);
      center.add(core);

      function createArc(radius, start, length, color, opacity, z, yScale) {
        var points = [];
        var steps = 110;
        for (var index = 0; index <= steps; index += 1) {
          var angle = start + (length * index / steps);
          points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * yScale,
            z
          ));
        }

        return new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity })
        );
      }

      var arcs = [
        createArc(1.28, -0.3, Math.PI * 1.18, 0x63e6c4, 0.54, 0.1, 0.64),
        createArc(1.42, 1.32, Math.PI * 0.86, 0x8fe8e3, 0.34, -0.03, 0.58),
        createArc(0.96, 2.82, Math.PI * 0.72, 0xf4f1e8, 0.22, 0.17, 0.7)
      ];

      arcs.forEach(function (arc, index) {
        arc.rotation.z = index * 0.18;
        aperture.add(arc);
      });

      var panelGeometry = new THREE.BoxGeometry(0.66, 0.38, 0.04);
      var panels = [];
      [
        { angle: -0.78, radius: 1.22, material: glassMaterial, scale: 1.02 },
        { angle: 0.58, radius: 1.2, material: skyMaterial, scale: 0.88 },
        { angle: 2.34, radius: 1.14, material: seaMaterial, scale: 0.76 },
        { angle: 3.78, radius: 1.2, material: sageMaterial, scale: 0.84 },
        { angle: 4.78, radius: 0.94, material: ivoryMaterial, scale: 0.56 }
      ].forEach(function (item) {
        var panel = new THREE.Mesh(panelGeometry, item.material);
        panel.position.set(Math.cos(item.angle) * item.radius, Math.sin(item.angle) * item.radius * 0.62, 0.16);
        panel.rotation.z = item.angle + Math.PI / 2;
        panel.scale.setScalar(item.scale);
        aperture.add(panel);
        panels.push(panel);

        var edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(panelGeometry),
          new THREE.LineBasicMaterial({ color: 0xa7f3de, transparent: true, opacity: 0.22 })
        );
        edge.position.copy(panel.position);
        edge.rotation.copy(panel.rotation);
        edge.scale.copy(panel.scale);
        aperture.add(edge);
      });

      var nodes = [];
      [0.12, 1.2, 2.18, 3.42, 4.48, 5.34].forEach(function (angle, index) {
        var node = new THREE.Mesh(
          new THREE.SphereGeometry(index % 2 ? 0.035 : 0.046, 24, 16),
          index % 2 ? skyMaterial : seaMaterial
        );
        var radius = index % 2 ? 1.08 : 1.36;
        node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, 0.24);
        aperture.add(node);
        nodes.push(node);
      });

      scene.add(new THREE.AmbientLight(0xf4f1e8, 1.25));
      var key = new THREE.DirectionalLight(0xf4f1e8, 2.2);
      key.position.set(2.8, 3.6, 4.8);
      scene.add(key);
      var rim = new THREE.PointLight(0x63e6c4, 1.8, 8);
      rim.position.set(-2.8, -1.2, 3.2);
      scene.add(rim);
      var fill = new THREE.PointLight(0x8fe8e3, 0.85, 7);
      fill.position.set(2.4, -2.2, 2.8);
      scene.add(fill);

      var pointer = { x: 0, y: 0 };
      canvas.parentElement.addEventListener("pointermove", function (event) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.22;
        pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 0.18;
      }, { passive: true });

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var width = Math.max(1, Math.floor(rect.width));
        var height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resize();
      var resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      var visible = true;
      var observer = new IntersectionObserver(function (entries) {
        visible = entries.some(function (entry) { return entry.isIntersecting; });
      }, { threshold: 0.02 });
      observer.observe(canvas);

      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var lastFrameTime = window.performance.now();
      var elapsedTime = 0;

      function animate(now) {
        requestAnimationFrame(animate);
        var delta = Math.min((now - lastFrameTime) / 1000, 0.04);
        lastFrameTime = now;
        if (!visible) return;

        elapsedTime += delta;
        var speed = reducedMotion ? 0.08 : 0.34;

        group.rotation.y += (pointer.x - group.rotation.y) * 0.035;
        group.rotation.x += (pointer.y - group.rotation.x) * 0.035;
        aperture.rotation.z += delta * speed * 0.34;
        outerRing.rotation.z -= delta * speed * 0.18;
        innerRing.rotation.z += delta * speed * 0.24;
        ribbon.rotation.x += delta * speed * 0.22;
        ribbon.rotation.y -= delta * speed * 0.3;
        center.rotation.y += delta * speed * 1.2;
        center.rotation.x += delta * speed * 0.55;

        arcs.forEach(function (arc, index) {
          arc.rotation.z += delta * speed * (index % 2 ? -0.12 : 0.1);
        });

        panels.forEach(function (panel, index) {
          panel.position.z = 0.1 + Math.sin(elapsedTime * 0.9 + index) * 0.035;
        });

        nodes.forEach(function (node, index) {
          var pulse = 1 + Math.sin(elapsedTime * 1.7 + index) * 0.12;
          node.scale.setScalar(pulse);
        });

        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    });
  }

  async function initThreeStage() {
    var canvases = document.querySelectorAll("[data-vgm-3d]");
    if (!canvases.length) return;

    let THREE;
    try {
      THREE = await import("https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.min.js");
    } catch (error) {
      canvases.forEach(function (canvas) {
        canvas.parentElement.classList.add("is-fallback");
      });
      return;
    }

    function roundedShape(width, height, radius) {
      var x = -width / 2;
      var y = -height / 2;
      var shape = new THREE.Shape();
      shape.moveTo(x + radius, y);
      shape.lineTo(x + width - radius, y);
      shape.quadraticCurveTo(x + width, y, x + width, y + radius);
      shape.lineTo(x + width, y + height - radius);
      shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      shape.lineTo(x + radius, y + height);
      shape.quadraticCurveTo(x, y + height, x, y + height - radius);
      shape.lineTo(x, y + radius);
      shape.quadraticCurveTo(x, y, x + radius, y);
      return shape;
    }

    function applyPlanarUvs(geometry, width, height) {
      var position = geometry.attributes.position;
      var uvs = [];
      for (var index = 0; index < position.count; index += 1) {
        uvs.push(position.getX(index) / width + 0.5);
        uvs.push(position.getY(index) / height + 0.5);
      }
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    }

    function createRoundedPlane(width, height, radius, material) {
      var geometry = new THREE.ShapeGeometry(roundedShape(width, height, radius), 28);
      applyPlanarUvs(geometry, width, height);
      return new THREE.Mesh(geometry, material);
    }

    function createRoundedPrism(width, height, depth, radius, material) {
      var geometry = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 10,
        bevelSize: Math.min(depth * 0.18, 0.028),
        bevelThickness: Math.min(depth * 0.18, 0.028),
        curveSegments: 24
      });
      geometry.center();
      geometry.computeVertexNormals();
      return new THREE.Mesh(geometry, material);
    }

    function drawRoundedRect(ctx, x, y, width, height, radius) {
      var r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function makeScreenTexture() {
      var canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 1280;
      var ctx = canvas.getContext("2d");

      var background = ctx.createLinearGradient(0, 0, 640, 1280);
      background.addColorStop(0, "#f8fbf7");
      background.addColorStop(0.45, "#e5f5ec");
      background.addColorStop(1, "#101716");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 640, 1280);

      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "#8ce7c6";
      drawRoundedRect(ctx, 396, 78, 180, 180, 90);
      ctx.fill();
      ctx.fillStyle = "#f4b28d";
      drawRoundedRect(ctx, 44, 574, 210, 210, 105);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(8,16,15,0.9)";
      ctx.font = "600 27px Manrope, Arial, sans-serif";
      ctx.fillText("9:41", 58, 80);
      ctx.fillStyle = "rgba(8,16,15,0.52)";
      drawRoundedRect(ctx, 516, 55, 62, 27, 13);
      ctx.fill();
      ctx.fillStyle = "rgba(8,16,15,0.9)";
      drawRoundedRect(ctx, 522, 61, 38, 15, 8);
      ctx.fill();

      ctx.fillStyle = "#08100f";
      ctx.font = "800 34px Sora, Manrope, Arial, sans-serif";
      ctx.fillText("VGM", 58, 158);
      ctx.fillStyle = "rgba(8,16,15,0.56)";
      ctx.font = "600 18px Manrope, Arial, sans-serif";
      ctx.fillText("Content pipeline", 58, 190);

      var card = ctx.createLinearGradient(58, 236, 582, 626);
      card.addColorStop(0, "#0d1514");
      card.addColorStop(0.55, "#15342d");
      card.addColorStop(1, "#f7f2e8");
      ctx.fillStyle = card;
      drawRoundedRect(ctx, 58, 236, 524, 390, 42);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.16)";
      drawRoundedRect(ctx, 90, 272, 168, 34, 17);
      ctx.fill();
      ctx.fillStyle = "#f8fbf7";
      ctx.font = "800 44px Sora, Manrope, Arial, sans-serif";
      ctx.fillText("Social", 92, 386);
      ctx.fillText("that sells.", 92, 442);
      ctx.fillStyle = "rgba(248,251,247,0.72)";
      ctx.font = "600 23px Manrope, Arial, sans-serif";
      ctx.fillText("Strategy + production + editing", 94, 504);

      ctx.strokeStyle = "rgba(255,255,255,0.48)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(468, 402, 68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(436, 402);
      ctx.lineTo(488, 374);
      ctx.lineTo(488, 430);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.fill();

      ctx.fillStyle = "rgba(8,16,15,0.92)";
      ctx.font = "800 24px Sora, Manrope, Arial, sans-serif";
      ctx.fillText("Today", 58, 710);
      ctx.fillStyle = "rgba(8,16,15,0.5)";
      ctx.font = "600 18px Manrope, Arial, sans-serif";
      ctx.fillText("Next posts ready", 58, 742);

      [
        { x: 58, y: 786, w: 246, h: 202, title: "Hook", color: "#8ce7c6" },
        { x: 336, y: 786, w: 246, h: 202, title: "Edit", color: "#f4b28d" },
        { x: 58, y: 1020, w: 524, h: 126, title: "Retention score", color: "#d8edf8" }
      ].forEach(function (item, index) {
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        drawRoundedRect(ctx, item.x, item.y, item.w, item.h, 30);
        ctx.fill();
        ctx.fillStyle = item.color;
        drawRoundedRect(ctx, item.x + 24, item.y + 24, index === 2 ? 86 : 56, 14, 7);
        ctx.fill();
        ctx.fillStyle = "#08100f";
        ctx.font = "800 25px Sora, Manrope, Arial, sans-serif";
        ctx.fillText(item.title, item.x + 24, item.y + 82);
        ctx.fillStyle = "rgba(8,16,15,0.52)";
        ctx.font = "600 17px Manrope, Arial, sans-serif";
        ctx.fillText(index === 2 ? "88% expected watch time" : "Ready for approval", item.x + 24, item.y + 122);
      });

      ctx.fillStyle = "rgba(8,16,15,0.22)";
      drawRoundedRect(ctx, 226, 1202, 188, 8, 4);
      ctx.fill();

      var texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    canvases.forEach(function (canvas) {
      var isHero = canvas.dataset.vgmVariant === "hero";
      var scene = new THREE.Scene();
      var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      });

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
      if (renderer.toneMapping !== undefined && THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = isHero ? 1.22 : 1.08;
      }

      var camera = new THREE.PerspectiveCamera(isHero ? 30 : 34, 1, 0.1, 100);
      camera.position.set(0, isHero ? 0.04 : 0, isHero ? 5.0 : 4.8);

      var root = new THREE.Group();
      root.scale.setScalar(isHero ? 0.96 : 0.82);
      scene.add(root);

      var phone = new THREE.Group();
      phone.rotation.set(-0.08, -0.42, -0.04);
      root.add(phone);

      var frameMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x101716,
        metalness: 0.78,
        roughness: 0.28,
        clearcoat: 0.78,
        clearcoatRoughness: 0.18
      });

      var sideMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd9e0d9,
        metalness: 0.82,
        roughness: 0.24,
        clearcoat: 0.74,
        clearcoatRoughness: 0.12
      });

      var screenMaterial = new THREE.MeshPhysicalMaterial({
        map: makeScreenTexture(),
        color: 0xffffff,
        metalness: 0.03,
        roughness: 0.14,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        emissive: 0x0b2420,
        emissiveIntensity: isHero ? 0.07 : 0.04,
        side: THREE.DoubleSide
      });

      var glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.02,
        transparent: true,
        opacity: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      var darkGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x07100f,
        metalness: 0.16,
        roughness: 0.18,
        clearcoat: 0.96,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide
      });

      var lensMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x070b0b,
        metalness: 0.24,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.02
      });

      var lensGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x95ffe1,
        metalness: 0.02,
        roughness: 0.02,
        transparent: true,
        opacity: 0.46,
        clearcoat: 1,
        clearcoatRoughness: 0.02
      });

      var accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x8ce7c6,
        metalness: 0.2,
        roughness: 0.34,
        emissive: 0x103c34,
        emissiveIntensity: 0.18
      });

      var body = createRoundedPrism(1.22, 2.52, 0.2, 0.18, frameMaterial);
      phone.add(body);

      var bodyEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(body.geometry, 28),
        new THREE.LineBasicMaterial({ color: 0xf8fbf7, transparent: true, opacity: 0.2 })
      );
      phone.add(bodyEdge);

      var screen = createRoundedPlane(1.06, 2.3, 0.13, screenMaterial);
      screen.position.z = 0.154;
      phone.add(screen);

      var glass = createRoundedPlane(1.04, 2.28, 0.12, glassMaterial);
      glass.position.z = 0.162;
      phone.add(glass);

      var island = createRoundedPlane(0.36, 0.086, 0.042, darkGlassMaterial);
      island.position.set(0, 1.03, 0.174);
      phone.add(island);

      var back = createRoundedPlane(1.1, 2.36, 0.14, new THREE.MeshPhysicalMaterial({
        color: 0xdfe4df,
        metalness: 0.08,
        roughness: 0.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
      }));
      back.position.z = -0.116;
      back.rotation.y = Math.PI;
      phone.add(back);

      var cameraIsland = createRoundedPrism(0.42, 0.54, 0.055, 0.1, sideMaterial);
      cameraIsland.position.set(-0.29, 0.76, -0.142);
      phone.add(cameraIsland);

      [
        { x: -0.36, y: 0.84, radius: 0.075 },
        { x: -0.22, y: 0.66, radius: 0.067 }
      ].forEach(function (item) {
        var lens = new THREE.Mesh(new THREE.CylinderGeometry(item.radius, item.radius, 0.036, 48), lensMaterial);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(item.x, item.y, -0.184);
        phone.add(lens);

        var lensGlass = new THREE.Mesh(new THREE.CircleGeometry(item.radius * 0.68, 40), lensGlassMaterial);
        lensGlass.position.set(item.x, item.y, -0.204);
        lensGlass.rotation.y = Math.PI;
        phone.add(lensGlass);
      });

      var flash = new THREE.Mesh(new THREE.SphereGeometry(0.028, 24, 16), accentMaterial);
      flash.position.set(-0.18, 0.86, -0.194);
      phone.add(flash);

      [
        { x: -0.635, y: 0.45, h: 0.38 },
        { x: 0.635, y: 0.22, h: 0.46 }
      ].forEach(function (button) {
        var sideButton = new THREE.Mesh(new THREE.BoxGeometry(0.035, button.h, 0.065), sideMaterial);
        sideButton.position.set(button.x, button.y, 0.01);
        phone.add(sideButton);
      });

      var highlight = createRoundedPlane(0.34, 1.72, 0.06, new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false
      }));
      highlight.position.set(-0.23, 0.08, 0.168);
      highlight.rotation.z = -0.18;
      phone.add(highlight);

      var halo = createRoundedPlane(1.48, 2.88, 0.24, new THREE.MeshBasicMaterial({
        color: isHero ? 0xf7fbf6 : 0x8ce7c6,
        transparent: true,
        opacity: isHero ? 0.12 : 0.08,
        side: THREE.DoubleSide,
        depthWrite: false
      }));
      halo.position.z = -0.32;
      root.add(halo);

      scene.add(new THREE.AmbientLight(0xf8fbf7, isHero ? 1.5 : 1.1));
      var key = new THREE.DirectionalLight(0xffffff, isHero ? 2.5 : 2.0);
      key.position.set(2.6, 3.2, 4.4);
      scene.add(key);
      var rim = new THREE.PointLight(0x8ce7c6, isHero ? 2.1 : 1.5, 8);
      rim.position.set(-2.4, -1.1, 3.2);
      scene.add(rim);
      var warm = new THREE.PointLight(0xf4b28d, isHero ? 1.05 : 0.72, 7);
      warm.position.set(2.1, -1.8, 2.6);
      scene.add(warm);

      var pointer = { x: 0, y: 0 };
      var pointerTarget = canvas.parentElement || canvas;
      pointerTarget.addEventListener("pointermove", function (event) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.42;
        pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 0.28;
      }, { passive: true });

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var width = Math.max(1, Math.floor(rect.width));
        var height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resize();
      var resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      var visible = true;
      var observer = new IntersectionObserver(function (entries) {
        visible = entries.some(function (entry) { return entry.isIntersecting; });
      }, { threshold: 0.02 });
      observer.observe(canvas);

      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var lastFrameTime = window.performance.now();
      var elapsedTime = 0;

      function animate(now) {
        requestAnimationFrame(animate);
        var delta = Math.min((now - lastFrameTime) / 1000, 0.04);
        lastFrameTime = now;
        if (!visible) return;

        elapsedTime += delta;
        var speed = reducedMotion ? 0.08 : 0.38;
        var baseSpin = elapsedTime * speed;

        phone.rotation.y = -0.44 + baseSpin + pointer.x;
        phone.rotation.x += ((-0.08 + Math.sin(elapsedTime * 0.8) * 0.035 + pointer.y) - phone.rotation.x) * 0.045;
        phone.rotation.z = -0.04 + Math.sin(elapsedTime * 0.55) * 0.022;
        phone.position.y = Math.sin(elapsedTime * 0.9) * 0.035;
        halo.rotation.z = -0.18 + Math.sin(elapsedTime * 0.5) * 0.04;
        screenMaterial.emissiveIntensity = (isHero ? 0.06 : 0.035) + Math.sin(elapsedTime * 1.3) * 0.01;

        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initContactForms();
    initPortfolioText();
    initThreeStage();
  });
})();

/* Offscreen-Videos pausieren: 8 Autoplay-Loops gleichzeitig kosten
   CPU, Akku und Bandbreite — abspielen soll nur, was sichtbar ist. */
(function () {
  "use strict";

  function initVideoManager() {
    if (!("IntersectionObserver" in window)) return;

    var videos = Array.prototype.slice.call(document.querySelectorAll("video[autoplay]"));
    if (!videos.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          if (video.paused) {
            var playing = video.play();
            if (playing && typeof playing.catch === "function") {
              playing.catch(function () {});
            }
          }
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { rootMargin: "120px 0px" });

    videos.forEach(function (video) {
      observer.observe(video);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVideoManager);
  } else {
    initVideoManager();
  }
})();
