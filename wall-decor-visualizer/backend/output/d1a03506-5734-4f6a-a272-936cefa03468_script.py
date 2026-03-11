OUTPUT_PATH = '/tmp/d1a03506-5734-4f6a-a272-936cefa03468.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Width: 14.5' (7' left section + 7'6" right section)
    - Total Wall Height: 9.0'
    - Opening (Door/AC area): 7.0' wide x 8.0' high
    - Wall Thickness: 0.5' (assumed standard)
    """
    
    # Clear existing objects in the scene
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define dimensions (converted to float feet)
    wall_w = 14.5
    wall_h = 9.0
    wall_d = 0.5
    
    op_w = 7.0
    op_h = 8.0

    # 1. Create the Main Wall
    # We use a unit cube and scale/position it so the bottom-left-front corner is at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Skeleton"
    wall.scale = (wall_w, wall_d, wall_h)
    wall.location = (wall_w / 2, wall_d / 2, wall_h / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening Cutter (Door and AC area)
    # This represents the structural void on the left side of the wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Scale cutter slightly deeper than the wall to ensure a clean boolean cut
    cutter.scale = (op_w, wall_d * 2, op_h)
    # Positioned at the bottom-left corner
    cutter.location = (op_w / 2, wall_d / 2, op_h / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Operation
    # Subtract the opening from the main wall
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Set active object to wall and apply modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Cleanup
    # Remove the cutter object as it's no longer needed
    bpy.data.objects.remove(cutter, do_unlink=True)

    # 5. Export to GLB
    # Exporting the entire scene (which now only contains the wall skeleton)
    bpy.ops.export_scene.gltf(
        filepath='/tmp/d1a03506-5734-4f6a-a272-936cefa03468.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()