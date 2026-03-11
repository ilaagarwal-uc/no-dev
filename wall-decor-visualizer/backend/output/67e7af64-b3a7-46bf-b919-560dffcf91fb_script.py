OUTPUT_PATH = '/tmp/67e7af64-b3a7-46bf-b919-560dffcf91fb.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Main Wall: 14'6" (14.5') width x 9' height.
    Opening (Door/AC area): 7' width x 8' height, located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (1 unit = 1 foot)
    # Total Width = 7' (opening width) + 7'6" (remaining wall width) = 14.5'
    # Total Height = 9'
    # Opening Width = 7'
    # Opening Height = 8'
    wall_width = 14.5
    wall_height = 9.0
    wall_thickness = 0.5  # Standard assumed thickness
    
    opening_width = 7.0
    opening_height = 8.0

    # 1. Create the Main Wall
    # Positioned so the bottom-left-front corner is at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 2. Create the Opening (Door and AC unit area)
    # Positioned at the left edge (x=0) and floor (z=0)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening_Cutout"
    # Scale opening slightly thicker on Y to ensure a clean boolean cut
    opening.scale = (opening_width, wall_thickness * 2, opening_height)
    opening.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 3. Apply Boolean Modifier to subtract the opening from the wall
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Set active object to wall and apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the opening helper object
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export to GLB format
    # use_selection=False ensures the entire scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/67e7af64-b3a7-46bf-b919-560dffcf91fb.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()