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
      cactus: new Material(new Textured_Phong(), {
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
      let randomInt = this.generate_noisy_sineWave(1, 1, 0.1);
      this.noisySineList.push(randomInt);
    }
    this.speed = 3;
    this.fov = 4;
  }

  generate_noisy_sineWave(frequency, amplitude, noiseFactor) {
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

  draw_cinematic_cam(model_transform, t) {
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

  generate_sinusoidal_path(x, amplitude, frequency, phase, t) {
    const z = amplitude * Math.sin(frequency * x + phase + t / 5);
    return [x, z];
  }

  calculate_tangent_angle(x, amplitude, frequency, phase, t) {
    const dx = 1;
    const [x1, z1] = this.generate_sinusoidal_path(x, amplitude, frequency, phase, t);
    const [x2, z2] = this.generate_sinusoidal_path(x + dx, amplitude, frequency, phase, t);
    return Math.atan2(z2 - z1, dx);
  }

  draw_train(context, program_state, model_transform, amplitude, frequency, phase, t) {
    model_transform = model_transform.times(Mat4.translation(t, -3, 0));
    let n = 6;
    for (let i = 0; i < n; i++) {
      const x = i * 8.1;
      const [x_pos, z_pos] = this.generate_sinusoidal_path(x, amplitude, frequency, phase, t);
      const tangent_angle = this.calculate_tangent_angle(x, amplitude, frequency, phase, t);
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

    model_transform = base;
    this.draw_train(context, program_state, model_transform, 4.5, 0.1, 0, -t);


    this.draw_sun(context, program_state, model_transform, t);

    this.draw_cinematic_cam(model_transform, t);

    model_transform = model_transform.times(Mat4.translation(0, -0.2, 0));
    this.draw_ground(context, program_state, model_transform, t);
    this.draw_mountain_range(context, program_state, model_transform, t);
    this.draw_trees(context, program_state, model_transform, t);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-1100, 0.1, 0));
    this.draw_ground_desert(context, program_state, model_transform, t);
    model_transform = base;
    model_transform = model_transform.times(Mat4.translation(-270, 0, 0));
    this.draw_desert(context, program_state, model_transform, t);
    model_transform = model_transform.times(Mat4.translation(30, 0, 0));
    this.draw_clouds(context, program_state, model_transform, t);

  }
}