OUTPUT_PATH = '/tmp/b5123871-1bee-499a-8c00-845de6255d54.glb'

import bpy

def create_wall_skeleton():
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (converted to meters for Blender: 1 foot = 0.3048 meters)
    ft_to_m = 0.3048
    
    wall_width = 14.5 * ft_to_m  # 7' (opening) + 7'6" (solid wall)
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.5 * ft_to_m
    
    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m
    
    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1, location=(wall_width / 2, wall_thickness / 2, wall_height / 2))
    main_wall = bpy.context.active_object
    main_wall.name = "Main_Wall"
    main_wall.scale = (wall_width, wall_thickness, wall_height)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 2. Create the Opening (Cutter)
    # The opening is on the left side, starting from the floor
    bpy.ops.mesh.primitive_cube_add(size=1, location=(opening_width / 2, wall_thickness / 2, opening_height / 2))
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Make cutter slightly thicker to ensure clean boolean cut
    cutter.scale = (opening_width, wall_thickness * 2, opening_height)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 3. Apply Boolean Modifier to create the skeleton
    bool_mod = main_wall.modifiers.new(name="Opening_Cut", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = main_wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # Export to GLB
    output_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False
    )

create_wall_skeleton()