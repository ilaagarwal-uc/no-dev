OUTPUT_PATH = '/tmp/df00f526-0c86-4514-874a-e094ff248ab5.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Wall Height: 9'
    - Total Wall Width: 7' (left section) + 7'6" (right section) = 14.5'
    - Door/AC Opening: 7' wide by 8' high, located at the bottom-left.
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    FT_TO_M = 0.3048

    # Wall Dimensions
    wall_width = 14.5 * FT_TO_M
    wall_height = 9.0 * FT_TO_M
    wall_thickness = 0.2  # Standard 20cm wall thickness
    
    # Opening Dimensions (Door + AC area)
    opening_width = 7.0 * FT_TO_M
    opening_height = 8.0 * FT_TO_M

    # 1. Create the Main Wall
    # Cube primitive is 2x2x2 by default, we use size=1 to make scaling intuitive
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Scale and position (Origin at bottom-left-front corner)
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening Cutout
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutout = bpy.context.active_object
    cutout.name = "Opening_Cutout"
    
    # Scale opening (slightly thicker on Y to ensure a clean boolean cut)
    cutout.scale = (opening_width, wall_thickness * 2, opening_height)
    # Position at the bottom-left corner
    cutout.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Apply Boolean Modifier to create the structural hole
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutout
    bool_mod.operation = 'DIFFERENCE'
    
    # Set active object to wall and apply modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the cutout helper object
    bpy.data.objects.remove(cutout, do_unlink=True)

    # 5. Export to GLB
    # use_selection=False ensures the entire scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/df00f526-0c86-4514-874a-e094ff248ab5.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly for headless blender
create_wall_skeleton()