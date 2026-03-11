OUTPUT_PATH = '/tmp/9214c029-57fb-4bd3-a0d9-efabc23e1022.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Width: 14.5' (7' opening + 7'6" solid section)
    - Total Wall Height: 9'
    - Opening Width: 7'
    - Opening Height: 8'
    - Wall Thickness: 0.5' (Standard assumption)
    """
    
    # Clear existing objects in the scene
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define dimensions (1 unit = 1 foot)
    wall_width = 14.5
    wall_height = 9.0
    wall_depth = 0.5
    
    opening_width = 7.0
    opening_height = 8.0
    opening_depth = 1.0  # Thicker than wall for a clean boolean cut
    
    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.dimensions = (wall_width, wall_depth, wall_height)
    # Position the wall so the bottom-left-front corner is at the origin (0,0,0)
    wall.location = (wall_width / 2, wall_depth / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 2. Create the Opening (Door/AC area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Wall_Opening"
    opening.dimensions = (opening_width, opening_depth, opening_height)
    # Position opening at the left side of the wall, starting from the floor
    opening.location = (opening_width / 2, wall_depth / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 3. Perform Boolean operation to cut the opening out of the wall
    bool_mod = wall.modifiers.new(name="OpeningCut", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)
    
    # 4. Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)
    
    # 5. Export the result to GLB format
    # The file will be saved in the current working directory of the blender process
    bpy.ops.export_scene.gltf(
        filepath='/tmp/9214c029-57fb-4bd3-a0d9-efabc23e1022.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()