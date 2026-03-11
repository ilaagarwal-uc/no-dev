OUTPUT_PATH = '/tmp/205eb89b-82a5-43ec-b449-0a2c323d00e3.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided dimensions:
    - Total Wall Width: 14'6" (7' + 7'6")
    - Total Wall Height: 9'
    - Door/Opening Width: 7'
    - Door/Opening Height: 8'
    - Position: Opening is located at the bottom-left of the wall.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    ft_to_m = 0.3048

    # Wall Dimensions
    wall_width = 14.5 * ft_to_m
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.1  # Standard representation thickness

    # Opening Dimensions (Door + AC area)
    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m
    opening_thickness = 0.3  # Thicker for clean boolean operation

    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    # Scale and position (centered on its volume)
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, 0, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening Cutter
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Scale and position (bottom-left aligned)
    cutter.scale = (opening_width, opening_thickness, opening_height)
    cutter.location = (opening_width / 2, 0, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Subtraction
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # 5. Export to GLB
    # Headless blender will export to the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/205eb89b-82a5-43ec-b449-0a2c323d00e3.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()