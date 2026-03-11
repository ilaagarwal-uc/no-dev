OUTPUT_PATH = '/tmp/ff550007-e30d-455e-ba04-a20ed1ea1cd2.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Height: 9'
    - Door/Opening Width: 7'
    - Door/Opening Height: 8'
    - Right Wall Section Width: 7'6" (7.5')
    - Top Wall Section Height: 1' (9' - 8')
    - Total Width: 14'6" (14.5')
    """
    
    # Clear existing objects in the scene to start fresh
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Define wall thickness (standard assumption: 0.5 feet)
    thickness = 0.5
    
    # 1. Create the Right Wall Section
    # Width: 7.5', Height: 9.0'
    # Position: To the right of the 7' opening. 
    # Center X = 7.0 + (7.5 / 2) = 10.75
    # Center Z = 9.0 / 2 = 4.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(10.75, 0, 4.5))
    wall_right = bpy.context.active_object
    wall_right.name = "Wall_Right_Section"
    wall_right.scale = (7.5, thickness, 9.0)
    
    # 2. Create the Top Wall Section (Header above the door)
    # Width: 7.0', Height: 1.0'
    # Position: Above the 8' opening.
    # Center X = 7.0 / 2 = 3.5
    # Center Z = 8.0 + (1.0 / 2) = 8.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.5, 0, 8.5))
    wall_top = bpy.context.active_object
    wall_top.name = "Wall_Top_Section"
    wall_top.scale = (7.0, thickness, 1.0)
    
    # Join the segments into a single mesh object representing the wall skeleton
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.join()
    skeleton_obj = bpy.context.active_object
    skeleton_obj.name = "Wall_Skeleton"
    
    # Ensure the origin is at the bottom-left corner (0,0,0) for better usability
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    # Export the reconstructed skeleton to GLB format
    # use_selection=False ensures all created geometry is included
    bpy.ops.export_scene.gltf(
        filepath='/tmp/ff550007-e30d-455e-ba04-a20ed1ea1cd2.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Call the function directly as per instructions
create_wall_skeleton()