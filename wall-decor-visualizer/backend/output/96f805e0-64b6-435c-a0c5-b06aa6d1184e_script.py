OUTPUT_PATH = '/tmp/96f805e0-64b6-435c-a0c5-b06aa6d1184e.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Width: 14.5' (7' left section + 7'6" right section)
    - Total Wall Height: 9'
    - Door Opening Width: 7'
    - Door Opening Height: 8'
    - Wall Thickness: 0.5' (assumed standard)
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define dimensions
    wall_width = 14.5
    wall_height = 9.0
    wall_thickness = 0.5
    
    door_width = 7.0
    door_height = 8.0
    
    # 1. Create the Main Wall
    # Cube size=1 means it's 1x1x1. We scale it to the desired dimensions.
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    # Position the wall so the bottom-left-front corner is at (0,0,0)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 2. Create the Door Opening (to be subtracted)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Door_Opening"
    # Make it slightly thicker for a clean boolean cut
    opening.scale = (door_width, wall_thickness * 2, door_height)
    # Position at the bottom left of the wall
    opening.location = (door_width / 2, wall_thickness / 2, door_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 3. Apply Boolean Modifier to create the opening
    bool_mod = wall.modifiers.new(name="Opening_Cut", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export to GLB
    # Headless blender will save this to the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/96f805e0-64b6-435c-a0c5-b06aa6d1184e.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly as requested
create_wall_skeleton()