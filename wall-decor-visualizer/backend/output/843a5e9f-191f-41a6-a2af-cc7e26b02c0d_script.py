OUTPUT_PATH = '/tmp/843a5e9f-191f-41a6-a2af-cc7e26b02c0d.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Width: 14'6" (7' left section + 7'6" right section)
    - Total Height: 9'
    - Opening (Door/AC area): 7' wide by 8' high (9' total - 1' top gap)
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor: 1 foot = 0.3048 meters
    FT_TO_M = 0.3048

    # Wall dimensions in meters
    wall_width_m = 14.5 * FT_TO_M
    wall_height_m = 9.0 * FT_TO_M
    wall_thickness_m = 0.2  # Standard wall thickness (~8 inches)

    # Opening dimensions in meters
    opening_width_m = 7.0 * FT_TO_M
    opening_height_m = 8.0 * FT_TO_M

    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    # Scale and position so the bottom-left corner is at the origin (0,0,0)
    wall.scale = (wall_width_m, wall_thickness_m, wall_height_m)
    wall.location = (wall_width_m / 2, wall_thickness_m / 2, wall_height_m / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Door/Window area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening_Cutout"
    # Make it slightly thicker than the wall to ensure a clean boolean operation
    opening.scale = (opening_width_m, wall_thickness_m * 2, opening_height_m)
    # Position at the left side of the wall, starting from the floor
    opening.location = (opening_width_m / 2, wall_thickness_m / 2, opening_height_m / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Subtract the opening from the wall using a Boolean modifier
    bool_mod = wall.modifiers.new(name="Subtract_Opening", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up: Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export the result to GLB format
    # use_selection=False ensures the whole scene (the wall) is exported
    bpy.ops.export_scene.gltf(filepath='/tmp/843a5e9f-191f-41a6-a2af-cc7e26b02c0d.glb', export_format='GLB', use_selection=False)

# Execute the function directly
create_wall_skeleton()