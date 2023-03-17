import { defs, tiny } from "./examples/common.js";
import { Canvas_Widget } from "./main-scene.js";

const { Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture } = tiny;

const { Cube, Axis_Arrows, Textured_Phong } = defs;

export class Project extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();
    let polyres = 24; // how detailed shapes are
    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.terrain = "mountain";

    this.shapes = {
      axis: new defs.Axis_Arrows(),
      box: new defs.Cube(),
      plane: new defs.Regular_2D_Polygon(polyres, polyres),
      wheel: new defs.Cylindrical_Tube(polyres, polyres),
      engine: new (defs.Cylindrical_Tube.prototype.make_flat_shaded_version())(polyres / 2, polyres / 2),
      disc_low_poly: new defs.Regular_2D_Polygon(polyres / 2, polyres / 2),
      disc: new defs.Regular_2D_Polygon(2 * polyres, 2 * polyres),
      mountain: new (defs.Cone_Tip.prototype.make_flat_shaded_version())(polyres / 4, polyres / 4),
      leaves: new (defs.Cone_Tip.prototype.make_flat_shaded_version())(polyres / 4, polyres / 4),
      trunk: new defs.Cylindrical_Tube(polyres / 6, polyres / 6),
      sphere_low_poly: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
      sphere_low_poly2: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
      sphere_low_poly3: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(3),
      sphere_low_poly4: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(4),
    };

    // *** Materials
    this.materials = {
      texture_box1: new Material(new Texture_Rotate(), {
        color: hex_color("#000000"),
        ambient: 1,
        diffusivity: 0.1,
        specularity: 0.1,
        texture: new Texture("assets/shipping.jpeg", "NEAREST"),
      }),
      cactus: new Material(new Texture_Rotate(), {
        ambient: 1,
        diffusivity: 0,
        specularity: 1,
        texture: new Texture("assets/cactus.png"),
      }),
      pink: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#f7cac9"),
      }),
      trainblue: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#6C698D"),
      }),
      darkgrey: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#29282A"),
      }),
      red: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#3E3D52"),
      }),
      suncolor: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#fdfd96"),
      }),
      wheelbrown: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#826D5E"),
      }),
      black: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#000000"),
      }),
      purple: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#c5b9cd"),
      }),
      sand: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#dddd87"),
      }),
      green: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.6,
        color: hex_color("#96ca96"),
      }),
      brown: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#7b5c43"),
      }),
      tan: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#8C8AA8"),
      }),
      white: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#ffffff"),
      }),
      stone: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#636266"),
      }),
      rock: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.5,
        color: hex_color("#444346"),
      }),
      dark_white: new Material(new defs.Phong_Shader(), {
        ambient: 0.9,
        diffusivity: 0.5,
        color: hex_color("#ffffff"),
      }),
    };
    this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

    this.randomList = [];
    for (let i = 0; i < 750; i++) {
      let randomInt = Math.floor(Math.random() * 51) - 25; // generate a random integer between -25 and 25
      this.randomList.push(randomInt);
    }
    this.randomList_pos = [];
    for (let i = 0; i < 750; i++) {
      let randomInt = Math.floor(Math.random() * 51) + 10; // generate a random integer between 1 and 25
      this.randomList_pos.push(randomInt);
    }
    this.noisySineList = [];
    for (let i = 0; i < 20; i++) {
      let randomInt = this.generateNoisySineWave(1, 1, 0.1);
      this.noisySineList.push(randomInt);
    }
    this.speed = 3;
    this.fov = 4;
  }

  generateNoisySineWave(frequency, amplitude, noiseFactor) {
    let numPoints = 100;
    let points = [];

    for (let i = 0; i < numPoints; i++) {
      let x = i / numPoints;
      let y = amplitude * Math.sin(2 * Math.PI * frequency * x);

      let noiseValue = (Math.random() - 0.5) * 2 * noiseFactor;

      let noisyValue = Math.ceil(10 * (y + noiseValue));

      points.push([x, noisyValue]);
    }
    return points;
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button("Increase Train Speed", ["t"], () => {
      this.speed += 0.01;
    });
    this.new_line();
    this.key_triggered_button("Decrease Train Speed", ["g"], () => {
      this.speed = this.speed > 1 ? this.speed - 0.01 : this.speed;
    });
    this.new_line();
    this.key_triggered_button("Train View", ["Control", "1"], () => (this.attached = () => this.train_pov));
    this.key_triggered_button("Train POV", ["Control", "2"], () => (this.attached = () => this.train_pov_engine));
    this.key_triggered_button("Cinematic POV", ["Control", "c"], () => (this.attached = () => this.cinematicCamera));
    this.new_line();
    this.key_triggered_button("Zoom In", ["Control", "3"], () => {
      this.fov += 2;
    });
    this.key_triggered_button("Zoom Out", ["Control", "4"], () => {
      if (this.fov > 2) {
        this.fov -= 2;
      }
    });
    this.new_line();
    // this.key_triggered_button("Change Terrain", ["Control", "5"], () => {
    //   this.terrain = this.terrain == "mountain" ? "desert" : "mountain";
    // });
  }

  draw_cinematic_cam(context, program_state, model_transform, t) {
    model_transform = model_transform
      .times(Mat4.translation(100, 140, 200))
      .times(Mat4.rotation(-Math.PI / 5, 1, 0, 0))
      .times(Mat4.rotation(Math.PI / 8, 0, 1, 0))
      .times(Mat4.translation(-t, 0, 0));

    this.cinematicCamera = model_transform;
  }
  draw_cactus_big(context, program_state, model_transform, t, r) {
    let base = model_transform;
    model_transform = model_transform.times(Mat4.rotation((r + 25) / 5, 0, 1, 0));
    model_transform = model_transform
      .times(Mat4.translation(0, 10, 0))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(5, 5, 10));
    model_transform = model_transform.times(Mat4.translation(0, 0, -1.5)).times(Mat4.scale(0.25, 0.25, 1));
    //draw trunk
    this.shapes.trunk.draw(context, program_state, model_transform, this.materials.cactus);
    let base2 = base;
    base = base.times(Mat4.rotation((r + 25) / 5, 0, 1, 0));
    base = base
      .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
      .times(Mat4.translation(2, -3, 0))
      .times(Mat4.scale(2, 0.6, 0.6));

    // draw cactus arm 1
    this.shapes.box.draw(context, program_state, base, this.materials.cactus);
    base = base.times(Mat4.translation(0.8, 1, 0)).times(Mat4.scale(0.2, 2, 1));
    this.shapes.box.draw(context, program_state, base, this.materials.cactus);

    base2 = base2.times(Mat4.rotation((r + 25) / 5, 0, 1, 0));
    base2 = base2
      .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
      .times(Mat4.translation(-2, -3, 0))
      .times(Mat4.scale(2, 0.6, 0.6));

    this.shapes.box.draw(context, program_state, base2, this.materials.cactus);

    base2 = base2.times(Mat4.translation(-0.8, 1, 0)).times(Mat4.scale(0.2, 2, 1));

    this.shapes.box.draw(context, program_state, base2, this.materials.cactus);
  }

  draw_cactus_small(context, program_state, model_transform, t) {
    model_transform = model_transform.times(Mat4.rotation(-Math.PI / 2, 1, 0, 0)).times(Mat4.scale(1.5, 1.5, 3));
    model_transform = model_transform.times(Mat4.translation(0, 0, -1.5)).times(Mat4.scale(0.3, 0.3, 1));
    this.shapes.trunk.draw(context, program_state, model_transform, this.materials.cactus);
  }

  draw_wheel(context, program_state, model_transform, t) {
    model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 0.25)).times(Mat4.rotation(-t / 1.5, 0, 0, 1));
    this.shapes.wheel.draw(context, program_state, model_transform, this.materials.stone);
    this.shapes.disc.draw(context, program_state, model_transform, this.materials.rock);
    let base = model_transform;
    model_transform = model_transform.times(Mat4.scale(0.05, 0.98, 0.25));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.stone);
    model_transform = base;
    model_transform = model_transform.times(Mat4.rotation(Math.PI / 2, 0, 0, 1));
    model_transform = model_transform.times(Mat4.scale(0.05, 0.98, 0.25));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.stone);
    model_transform = base;
    model_transform = model_transform.times(Mat4.rotation(Math.PI / 4, 0, 0, 1));
    model_transform = model_transform.times(Mat4.scale(0.05, 0.98, 0.25));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.stone);
    model_transform = base;
    model_transform = model_transform.times(Mat4.rotation(Math.PI / 2, 0, 0, 1));
    model_transform = model_transform.times(Mat4.scale(0.05, 0.98, 0.25));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.stone);
  }

  draw_box(context, program_state, model_transform, t) {
    this.shapes.box.draw(context, program_state, model_transform, this.materials.trainblue);
  }

  draw_wheel_base(context, program_state, model_transform, t, spacing = 1.5) {
    let base = model_transform;
    model_transform = model_transform.times(Mat4.translation(spacing / 2, -1.25, 0)).times(Mat4.scale(1, 0.35, 0.75));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.darkgrey);

    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(0, -1.5, -0.76));
    this.draw_wheel(context, program_state, model_transform, t);
    model_transform = model_transform.times(Mat4.translation(0, 0, 1.52));
    this.draw_wheel(context, program_state, model_transform, t);
    model_transform = model_transform.times(Mat4.translation(spacing, 0, 0));
    this.draw_wheel(context, program_state, model_transform, t);
    model_transform = model_transform.times(Mat4.translation(0, 0, -1.52));
    this.draw_wheel(context, program_state, model_transform, t);
  }

  draw_empty_box(context, program_state, model_transform, t) {
    let base = model_transform;
    model_transform = model_transform.times(Mat4.scale(4, 0.1, 1));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.tan);
    model_transform = base;
    model_transform = model_transform
      .times(Mat4.translation(0, 0.9, -0.9))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(4, 0.1, 1));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.tan);
    model_transform = model_transform.times(Mat4.translation(0, 18, 0));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.tan);
    model_transform = base;
    model_transform = model_transform
      .times(Mat4.translation(-3.9, 0.9, 0))
      .times(Mat4.rotation(Math.PI / 2, 0, 0, 1))
      .times(Mat4.scale(1, 0.1, 1));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.tan);
    model_transform = model_transform.times(Mat4.translation(0, -78, 0));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.tan);
  }

  draw_boxcar(context, program_state, model_transform, t, i) {
    let base = model_transform;
    // main body
    if (i % 2 == 0) {
      // no roof
      model_transform = model_transform.times(Mat4.translation(0, -0.8, 0));
      this.draw_empty_box(context, program_state, model_transform, t);
      model_transform = model_transform.times(Mat4.scale(4, 1, 1));
      // under belly
      model_transform = model_transform.times(Mat4.translation(0, -0.25, 0)).times(Mat4.scale(1, 0.2, 0.5));
      this.draw_box(context, program_state, model_transform, t);
      model_transform = model_transform.times(Mat4.translation(0, -1, 0)).times(Mat4.scale(1.15, 0.5, 0.3));
      this.draw_box(context, program_state, model_transform, t);
    } else {
      // roof
      model_transform = model_transform.times(Mat4.scale(4, 1, 1));
      model_transform = model_transform.times(Mat4.translation(0, 0.1, 0));
      this.draw_box(context, program_state, model_transform, t);
      // under belly
      model_transform = model_transform.times(Mat4.translation(0, -0.1, 0));
      model_transform = model_transform.times(Mat4.translation(0, -0.25, 0)).times(Mat4.scale(1, 1, 0.5));
      this.draw_box(context, program_state, model_transform, t);
      // links
      model_transform = model_transform.times(Mat4.translation(0, -1, 0)).times(Mat4.scale(1.15, 0.1, 0.3));
      this.draw_box(context, program_state, model_transform, t);
    }
    // wheels
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-3.5, 0, 0));
    this.draw_wheel_base(context, program_state, model_transform, t);
    model_transform = model_transform.times(Mat4.translation(5.5, 0, 0));
    this.draw_wheel_base(context, program_state, model_transform, t);
  }

  draw_locomotive(context, program_state, model_transform, t) {
    let base = model_transform;
    model_transform = model_transform.times(Mat4.translation(2.75, -0.9, 0)).times(Mat4.scale(0.35, 0.5, 1));
    this.draw_empty_box(context, program_state, model_transform, t);
    model_transform = base;
    // links
    model_transform = model_transform.times(Mat4.translation(2.75, -1.25, 0)).times(Mat4.scale(2.75, 0.1, 0.25));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.darkgrey);

    // wheels
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(2, 0, 0));
    this.draw_wheel_base(context, program_state, model_transform, t);

    // engine
    model_transform = base;
    this.train_pov_engine = base.times(Mat4.translation(-8, 0, 4)).times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
    base = base.times(Mat4.translation(-0.5, 0, 0));
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(0, 0.25, 0)).times(Mat4.scale(1, 1.2, 1));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.red);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-2, -1, 0)).times(Mat4.scale(3.5, 0.2, 1));
    this.shapes.box.draw(context, program_state, model_transform, this.materials.red);
    model_transform = base;
    model_transform = model_transform
      .times(Mat4.translation(-2, 0, 0))
      .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
      .times(Mat4.scale(1, 1, 5.5));
    this.shapes.engine.draw(context, program_state, model_transform, this.materials.tan);
    model_transform = model_transform.times(Mat4.translation(0, 0, -0.5));
    this.shapes.disc_low_poly.draw(context, program_state, model_transform, this.materials.tan);
    model_transform = base;
    model_transform = model_transform
      .times(Mat4.translation(-4, 1, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.25, 0.25, 1));
    this.shapes.wheel.draw(context, program_state, model_transform, this.materials.red);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-4, 2.25, 0));
    this.draw_smokestack(context, program_state, model_transform, t);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(0, 1.5, 0)).times(Mat4.scale(1.2, 0.1, 1.1));
    this.draw_box(context, program_state, model_transform, t);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-1, 1, 0)).times(Mat4.scale(1.5, 1.5, 1.5));
    this.draw_wheel_base(context, program_state, model_transform, t, 1);
    model_transform = model_transform.times(Mat4.translation(-2.35, -0.5, 0)).times(Mat4.scale(0.75, 0.75, 1));
    this.draw_wheel_base(context, program_state, model_transform, t, 1);
  }

  generateSinusoidalPath(x, amplitude, frequency, phase, t) {
    const z = amplitude * Math.sin(frequency * x + phase + t / 5);
    return [x, z];
  }

  calculateTangentAngle(x, amplitude, frequency, phase, t) {
    const dx = 1;
    const [x1, z1] = this.generateSinusoidalPath(x, amplitude, frequency, phase, t);
    const [x2, z2] = this.generateSinusoidalPath(x + dx, amplitude, frequency, phase, t);
    return Math.atan2(z2 - z1, dx);
  }

  drawTrain(context, program_state, model_transform, amplitude, frequency, phase, t) {
    model_transform = model_transform.times(Mat4.translation(t, -3, 0));
    let n = 6;
    for (let i = 0; i < n; i++) {
      const x = i * 8.1;
      const [x_pos, z_pos] = this.generateSinusoidalPath(x, amplitude, frequency, phase, t);
      const tangent_angle = this.calculateTangentAngle(x, amplitude, frequency, phase, t);
      const model_transform_with_position = model_transform.times(Mat4.translation(x_pos, 0, z_pos));
      const model_transform_with_orientation = model_transform_with_position.times(Mat4.rotation(-tangent_angle, 0, 1, 0));

      if (i == 0) {
        this.draw_locomotive(context, program_state, model_transform_with_orientation, t);
      } else {
        this.draw_boxcar(context, program_state, model_transform_with_orientation, t, i);
      }
    }
  }

  draw_smokestack(context, program_state, model_transform, t) {
    let modulation = (0.1 * Math.cos((Math.PI / 5) * t)) / +2;

    model_transform = model_transform.times(Mat4.translation(0, modulation * 4, 0));
    model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 0.5));

    const smoke_shape_arr = new Map([
      [0, this.shapes.sphere_low_poly],
      [1, this.shapes.sphere_low_poly2],
      [2, this.shapes.sphere_low_poly2],
      [3, this.shapes.sphere_low_poly],
      [4, this.shapes.sphere_low_poly2],
    ]);

    for (let i = 0; i < 5; i++) {
      smoke_shape_arr.get(i).draw(context, program_state, model_transform, this.materials.dark_white);
      model_transform = model_transform.times(Mat4.scale(1.15, 1.15, 1.15));
      model_transform = model_transform.times(Mat4.translation(i ** 2 / 9, 0.6, 0));
    }
  }

  drawTrain(context, program_state, model_transform, amplitude, frequency, phase, t) {
    model_transform = model_transform.times(Mat4.translation(t, -3, 0));
    let n = 6;
    for (let i = 0; i < n; i++) {
      const x = i * 8.1;
      const [x_pos, z_pos] = this.generateSinusoidalPath(x, amplitude, frequency, phase, t);
      const tangent_angle = this.calculateTangentAngle(x, amplitude, frequency, phase, t);
      const model_transform_with_position = model_transform.times(Mat4.translation(x_pos, 0, z_pos));
      const model_transform_with_orientation = model_transform_with_position.times(Mat4.rotation(-tangent_angle, 0, 1, 0));

      if (i == 0) {
        this.draw_locomotive(context, program_state, model_transform_with_orientation, t);
      } else {
        this.draw_boxcar(context, program_state, model_transform_with_orientation, t, i);
      }
    }
    this.train_pov = model_transform
      .times(Mat4.translation(-10, 5, -2))
      .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
      .times(Mat4.rotation(-Math.PI / 11, 1, 0, 0));
  }

  draw_cloud(context, program_state, model_transform, t, j) {
    let modulation = Math.cos((Math.PI / 10) * t) / +2;

    let base = model_transform;
    for (let i = j; i < this.randomList.length / 10; i += 3) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(this.randomList[i] / 15, this.randomList[i + 1] / 13, this.randomList[i + 2] / 15)).times(Mat4.scale(this.randomList_pos[i] / 15, this.randomList_pos[i] / 15, this.randomList_pos[i] / 15));
      this.shapes.sphere_low_poly.draw(context, program_state, model_transform, this.materials.dark_white);
    }
  }

  draw_clouds(context, program_state, model_transform, t) {
    model_transform = model_transform.times(Mat4.translation(1, 40, 1));
    let base = model_transform;
    let j = 0;
    for (let i = 0; i < this.randomList.length / 9; i += 3) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(13 * this.randomList[i], this.randomList[i + 1] / 10, 6 * this.randomList[i + 2])).times(Mat4.scale(this.randomList_pos[i] / 8, this.randomList_pos[i] / 10, this.randomList_pos[i] / 10));
      this.draw_cloud(context, program_state, model_transform, t, j);
      j += 3;
    }
  }

  modulate_color_trees(t, rng) {
    let modulation = Math.sin(((2 * Math.PI) / 150) * t + 11 + rng);
    let r = (1 - modulation) * 0.78 + modulation * 0.88;
    let g = (1 - modulation) * 0.845 + modulation * 0.88;
    let b = (1 - modulation) * 0.78 + modulation * 0.88;
    return color(r, g, b, 1);
  }

  draw_tree_big(context, program_state, model_transform, t, rng) {
    model_transform = model_transform
      .times(Mat4.translation(0, -0.5, 0))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(3, 3, 3));
    this.shapes.leaves.draw(context, program_state, model_transform, this.materials.green.override({ color: this.modulate_color_trees(t, rng) }));
    model_transform = model_transform.times(Mat4.translation(0, 0, -1.5)).times(Mat4.scale(0.25, 0.25, 1));
    this.shapes.trunk.draw(context, program_state, model_transform, this.materials.brown);
  }

  draw_tree_small(context, program_state, model_transform, t, rng) {
    model_transform = model_transform
      .times(Mat4.translation(0, -3, 0))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(1.5, 1.5, 1.5));
    this.shapes.leaves.draw(context, program_state, model_transform, this.materials.green.override({ color: this.modulate_color_trees(t, rng) }));
    model_transform = model_transform.times(Mat4.translation(0, 0, -1.5)).times(Mat4.scale(0.15, 0.15, 1));
    this.shapes.trunk.draw(context, program_state, model_transform, this.materials.brown);
  }

  draw_trees(context, program_state, model_transform, t) {
    let base = model_transform;
    for (let i = 0; i < this.randomList.length - 2; i += 2) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(5 * this.randomList[i], 0, 2 * (this.randomList[i + 1] - 30)));
      if (i % 4 == 0) {
        this.draw_tree_small(context, program_state, model_transform, t, this.randomList[i]);
      } else {
        this.draw_tree_big(context, program_state, model_transform, t, this.randomList[i]);
      }
    }
    for (let i = 1; i < this.randomList.length - 2; i += 2) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(-5 * this.randomList[i], 0, -2 * (this.randomList[i + 1] - 30)));
      if ((i - 1) % 4 == 0) {
        this.draw_tree_small(context, program_state, model_transform, t, this.randomList[i]);
      } else {
        this.draw_tree_big(context, program_state, model_transform, t, this.randomList[i]);
      }
    }
  }

  draw_mountain(context, program_state, model_transform, t, h = 0) {
    model_transform = model_transform
      .times(Mat4.translation(0, h, 0))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(40, 40, 30));
    this.shapes.mountain.draw(context, program_state, model_transform, this.materials.purple);
    model_transform = model_transform.times(Mat4.translation(0, 0, 0.91)).times(Mat4.scale(0.1, 0.1, 0.1));
    this.shapes.mountain.draw(context, program_state, model_transform, this.materials.white);
  }

  draw_mountain_range(context, program_state, model_transform, t) {
    let base = model_transform;
    for (let i = 0; i < this.randomList.length - 100; i += 50) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(5 * this.randomList[i], 0, 2 * (this.randomList[i + 1] - 45)));
      this.draw_mountain(context, program_state, model_transform, t, this.randomList[i]);
    }
    for (let i = 1; i < this.randomList.length - 100; i += 50) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(-5 * this.randomList[i], 0, -2 * (this.randomList[i + 1] - 45)));
      this.draw_mountain(context, program_state, model_transform, t, this.randomList[i]);
    }
  }

  draw_desert(context, program_state, model_transform, t) {
    let base = model_transform;
    for (let i = 0; i < this.randomList.length / 3 - 2; i += 2) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(5 * this.randomList[i], 0, 2 * (this.randomList[i + 1] - 30)));
      if (i % 4 == 0) {
        this.draw_cactus_small(context, program_state, model_transform, t, this.randomList[i]);
      } else {
        this.draw_cactus_big(context, program_state, model_transform, t, this.randomList[i]);
      }
    }
    for (let i = 1; i < this.randomList.length / 3 - 2; i += 2) {
      model_transform = base;
      model_transform = model_transform.times(Mat4.translation(-5 * this.randomList[i], 0, -2 * (this.randomList[i + 1] - 30)));
      if ((i - 1) % 4 == 0) {
        this.draw_cactus_small(context, program_state, model_transform, t, this.randomList[i]);
      } else {
        this.draw_cactus_big(context, program_state, model_transform, t, this.randomList[i]);
      }
    }
  }

  modulate_color_ground(t) {
    let modulation = Math.sin(((2 * Math.PI) / 150) * t + 11);
    let r = (1 - modulation) * 0.79 + modulation * 0.88;
    let g = (1 - modulation) * 0.845 + modulation * 0.88;
    let b = (1 - modulation) * 0.68 + modulation * 0.88;
    return color(r, g, b, 1);
  }

  draw_ground(context, program_state, model_transform, t) {
    model_transform = model_transform
      .times(Mat4.translation(-430, -5, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(1000, 1000, 1000));
    this.shapes.plane.draw(context, program_state, model_transform, this.materials.sand.override({ color: this.modulate_color_ground(t) }));
  }

  draw_sun(context, program_state, model_transform, t) {
    model_transform = model_transform
      .times(Mat4.scale(80, 80, 80))
      .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
      .times(Mat4.translation(0, 0, 7));
    this.shapes.disc.draw(context, program_state, model_transform, this.materials.suncolor);
  }

  draw_ground_desert(context, program_state, model_transform, t) {
    model_transform = model_transform
      .times(Mat4.translation(0, -5, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.rotation(1, 0, 0, 1))
      .times(Mat4.scale(1000, 1000, 1000));
    this.shapes.plane.draw(context, program_state, model_transform, this.materials.sand);
  }

  display(context, program_state) {
    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push((context.scratchpad.controls = new defs.Movement_Controls()));
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    if (this.attached) {
      const desired = Mat4.inverse(this.attached().times(Mat4.translation(0, 0, 5)));
      const blend_factor = 0.97;
      const current = desired.map((x, i) => Vector.from(program_state.camera_transform[i]).mix(x, blend_factor));
      var state = this.attached() != this.initial_camera_location ? current : this.initial_camera_location;
      program_state.set_camera(state);
    }

    // higher = narrower
    program_state.projection_transform = Mat4.perspective(Math.PI / this.fov, context.width / context.height, 0.1, 1000);

    const t = (this.speed * program_state.animation_time) / 1000,
      dt = program_state.animation_delta_time / 1000;
    const yellow = hex_color("#fac91a");
    let model_transform = Mat4.identity();

    const light_position = vec4(100, 100, 100, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 15000)];

    this.move = false;

    let base = model_transform;

    // ground
    // model_transform = model_transform.times(Mat4.translation(-1100, 0.1, 0));

    model_transform = base;
    // objects
    // this.draw_box(context, program_state, model_transform, t);
    // this.draw_wheel(context, program_state, model_transform, t);
    // this.draw_boxcar(context, program_state, model_transform, t);
    // this.draw_cactus_big(context, program_state, model_transform, t);

    // this.drawCubeTrain(context, program_state, model_transform, 5, 0.1, 0, t);
    this.drawTrain(context, program_state, model_transform, 4.5, 0.1, 0, -t);

    // model_transform = model_transform.times(Mat4.translation(3, 0, 0));

    this.draw_sun(context, program_state, model_transform, t);

    this.draw_cinematic_cam(context, program_state, model_transform, t);

    // if (this.terrain == "mountain") {
    model_transform = model_transform.times(Mat4.translation(0, -0.2, 0));
    this.draw_ground(context, program_state, model_transform, t);
    this.draw_mountain_range(context, program_state, model_transform, t);
    this.draw_trees(context, program_state, model_transform, t);
    // } else {
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-1100, 0.1, 0));
    this.draw_ground_desert(context, program_state, model_transform, t);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-270, 0, 0));
    this.draw_desert(context, program_state, model_transform, t);
    // }
    model_transform = model_transform.times(Mat4.translation(30, 0, 0));
    this.draw_clouds(context, program_state, model_transform, t);

    //model_transform = model_transform.times(Mat4.translation(-10, 0, -5));
    // this.shapes.axis.draw(
    //   context,
    //   program_state,
    //   model_transform,
    //   this.materials.pink
    // );
  }
}

class Gouraud_Shader extends Shader {
  // This is a Shader using Phong_Shader as template
  // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
      ` 
        precision mediump float;
        const int N_LIGHTS = ` +
      this.num_lights +
      `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;

        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `
    );
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                vertex_color = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                vertex_color.xyz += phong_model_lights( N, vertex_worldspace );
            } `
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
            void main(){                                                           
                gl_FragColor = vertex_color;
            } `
    );
  }

  send_material(gl, gpu, material) {
    // send_material(): Send the desired shape-wide material qualities to the
    // graphics card, where they will tweak the Phong lighting formula.
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    // send_gpu_state():  Send the state of our whole drawing context to the GPU.
    const O = vec4(0, 0, 0, 1),
      camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
    const squared_scale = model_transform
      .reduce((acc, r) => {
        return acc.plus(vec4(...r).times_pairwise(r));
      }, vec4(0, 0, 0, 0))
      .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.
    const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
    gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
    gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

    // Omitting lights will show only the material color, scaled by the ambient term:
    if (!gpu_state.lights.length) return;

    const light_positions_flattened = [],
      light_colors_flattened = [];
    for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
      light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
      light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
    }
    gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
    gl.uniform4fv(gpu.light_colors, light_colors_flattened);
    gl.uniform1fv(
      gpu.light_attenuation_factors,
      gpu_state.lights.map((l) => l.attenuation)
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // receives ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.

    // Fill in any missing fields in the Material object with custom defaults for this shader:
    const defaults = {
      color: color(0, 0, 0, 1),
      ambient: 0,
      diffusivity: 1,
      specularity: 1,
      smoothness: 40,
    };
    material = Object.assign({}, defaults, material);

    this.send_material(context, gpu_addresses, material);
    this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
  }
}

class Ring_Shader extends Shader {
  update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
    // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
    const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
      PCM = P.times(C).times(M);
    context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
    context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    return (
      this.shared_glsl_code() +
      `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          point_position = model_transform * vec4(position, 1);
          center = model_transform * vec4(0, 0, 0, 1);
          gl_Position = projection_camera_model_transform * vec4(position, 1);
        }`
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    return (
      this.shared_glsl_code() +
      `
        void main(){
          float scalar = sin(19.0 * distance(point_position.xyz, center.xyz));
          gl_FragColor = scalar * vec4(0.69, 0.5, 0.25, 1);
        }`
    );
  }
}

class Texture_Rotate extends Textured_Phong {
  fragment_glsl_code() {
    return (
      this.shared_glsl_code() +
      `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                float r = 0.25 * 2.0 * 3.14159 * mod(animation_time, 20.0);
                mat4 m = mat4(cos(r), -sin(r), 0.0, 0.0, sin(r), cos(r), 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
                vec4 v = m * (vec4(f_tex_coord, 0.0, 0.0) + vec4(-0.5, -0.5, 0.0, 0.0)) + vec4(0.5, 0.5, 0.0, 0.0);
                
                vec4 tex_color = texture2D( texture, v.xy );

                float x = mod(v.x, 1.0), y = mod(v.y, 1.0);
          

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `
    );
  }
}
